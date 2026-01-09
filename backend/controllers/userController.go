package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"unicode/utf8"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func GetAllInterests(c *fiber.Ctx) error {
	var interests []models.Interest
	database.DB.Find(&interests)
	return c.JSON(interests)
}

func GetMe(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var user models.User
	if err := database.DB.Preload("Interests").First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}
	var interestsList []string
	for _, i := range user.Interests {
		interestsList = append(interestsList, i.Slug)
	}
	user.InterestsList = interestsList
	return c.JSON(user)
}

func GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User
	if err := database.DB.Preload("Interests").First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}
	var interestsList []string
	for _, i := range user.Interests {
		interestsList = append(interestsList, i.Slug)
	}
	user.InterestsList = interestsList
	return c.JSON(user)
}

// ✅ UPDATE ME (CON LÓGICA DE FOTO PRINCIPAL)
func UpdateMe(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var user models.User

	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	var updateData struct {
		Name      string   `json:"name"`
		Bio       string   `json:"bio"`
		Gender    string   `json:"gender"`
		Photo     string   `json:"photo"`
		Photos    []string `json:"photos"`
		Interests []string `json:"interests"`
	}

	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Validación Bio
	if utf8.RuneCountInString(updateData.Bio) > 1000 {
		return c.Status(400).JSON(fiber.Map{"error": "La biografía es demasiado larga (máx 1000 caracteres)"})
	}

	if updateData.Name != "" {
		user.Name = updateData.Name
	}
	user.Bio = updateData.Bio // Actualizamos bio siempre
	if updateData.Gender != "" {
		user.Gender = updateData.Gender
	}

	// ✅ LÓGICA DE FOTOS
	// Si nos envían un array de fotos (reordenado o nuevo)
	if updateData.Photos != nil {
		user.Photos = updateData.Photos

		// Sincronizar automáticamente la foto principal con la primera de la lista
		if len(user.Photos) > 0 {
			user.Photo = user.Photos[0]
		}
	} else if updateData.Photo != "" {
		// Fallback por si solo envían "photo" singular
		user.Photo = updateData.Photo
	}

	if updateData.Interests != nil {
		var selectedInterests []models.Interest
		database.DB.Where("slug IN ?", updateData.Interests).Find(&selectedInterests)
		database.DB.Model(&user).Association("Interests").Replace(selectedInterests)
	}

	database.DB.Save(&user)

	database.DB.Preload("Interests").First(&user, user.ID)
	var interestsList []string
	for _, i := range user.Interests {
		interestsList = append(interestsList, i.Slug)
	}
	user.InterestsList = interestsList

	return c.JSON(user)
}

// DeleteAccount y ChangePassword (Sin cambios)
func DeleteAccount(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var req struct {
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Se requiere la contraseña para confirmar"})
	}

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "Contraseña incorrecta"})
	}

	database.DB.Where("user_id = ?", userId).Delete(&models.Match{})
	database.DB.Where("user_1_id = ? OR user_2_id = ?", userId, userId).Delete(&models.Match{})
	database.DB.Where("user_id = ?", userId).Delete(&models.Message{})
	database.DB.Where("user_id = ?", userId).Delete(&models.PostLike{})
	database.DB.Where("user_id = ?", userId).Delete(&models.Comment{})
	database.DB.Where("user_id = ?", userId).Delete(&models.Story{})
	database.DB.Delete(&models.User{}, userId)

	return c.JSON(fiber.Map{"message": "Cuenta eliminada correctamente"})
}

func ChangePassword(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	if len(req.NewPassword) < 6 {
		return c.Status(400).JSON(fiber.Map{"error": "La nueva contraseña debe tener al menos 6 caracteres"})
	}

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "Tu contraseña actual es incorrecta"})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 10)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al procesar contraseña"})
	}

	user.Password = string(hash)
	database.DB.Save(&user)

	return c.JSON(fiber.Map{"message": "Contraseña actualizada exitosamente"})
}
