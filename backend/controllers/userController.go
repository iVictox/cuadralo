package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

	"github.com/gofiber/fiber/v2"
)

// ✅ NUEVO: Obtener todos los intereses disponibles
func GetAllInterests(c *fiber.Ctx) error {
	var interests []models.Interest
	database.DB.Find(&interests)
	return c.JSON(interests)
}

// Obtener mi propio perfil
func GetMe(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var user models.User

	if err := database.DB.Preload("Interests").First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Llenar la lista con SLUGS para lógica de selección en frontend
	var interestsList []string
	for _, i := range user.Interests {
		interestsList = append(interestsList, i.Slug)
	}
	user.InterestsList = interestsList

	return c.JSON(user)
}

// Obtener un usuario por ID
func GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User
	if err := database.DB.Preload("Interests").First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}
	return c.JSON(user)
}

// Actualizar mi perfil (Selección de intereses existentes)
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
		Interests []string `json:"interests"` // Recibe Slugs (ej: ["gym", "music"])
	}

	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if updateData.Name != "" {
		user.Name = updateData.Name
	}
	if updateData.Bio != "" {
		user.Bio = updateData.Bio
	}
	if updateData.Gender != "" {
		user.Gender = updateData.Gender
	}
	if updateData.Photo != "" {
		user.Photo = updateData.Photo
	}

	if updateData.Photos != nil {
		user.Photos = updateData.Photos
	}

	// ✅ ACTUALIZACIÓN: Buscar intereses existentes por Slug
	if updateData.Interests != nil {
		var selectedInterests []models.Interest
		// Buscamos en la tabla 'interests' los que coincidan con los slugs enviados
		database.DB.Where("slug IN ?", updateData.Interests).Find(&selectedInterests)

		// Reemplazamos la asociación
		database.DB.Model(&user).Association("Interests").Replace(selectedInterests)
	}

	database.DB.Save(&user)

	return c.JSON(user)
}

func DeleteAccount(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	database.DB.Where("user_id = ?", userId).Delete(&models.Match{})
	database.DB.Where("user_1_id = ? OR user_2_id = ?", userId, userId).Delete(&models.Match{})
	database.DB.Where("user_id = ?", userId).Delete(&models.Message{})
	database.DB.Delete(&models.User{}, userId)
	return c.JSON(fiber.Map{"message": "Cuenta eliminada"})
}

func ChangePassword(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Función pendiente"})
}
