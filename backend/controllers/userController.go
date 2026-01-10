package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// --- BUSCADOR POR INTERESES ---
func SearchUsers(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	query := c.Query("q")
	interestsStr := c.Query("interests") // Ejemplo: "futbol,cine,viajes"

	db := database.DB.Model(&models.User{})

	// 1. Excluir al propio usuario
	db = db.Where("users.id != ?", myId)

	// 2. Filtro de Texto (Nombre, Username, Bio)
	if query != "" {
		searchLike := "%" + query + "%"
		db = db.Where("(users.username ILIKE ? OR users.name ILIKE ? OR users.bio ILIKE ?)", searchLike, searchLike, searchLike)
	}

	// 3. Filtro por Intereses
	if interestsStr != "" {
		slugs := strings.Split(interestsStr, ",")
		if len(slugs) > 0 {
			// Hacemos JOIN con la tabla pivote y la tabla de intereses
			// Filtramos usuarios que tengan AL MENOS UNO de los intereses seleccionados
			db = db.Joins("JOIN user_interests ui ON ui.user_id = users.id").
				Joins("JOIN interests i ON i.id = ui.interest_id").
				Where("i.slug IN ?", slugs).
				Group("users.id")
		}
	}

	var users []models.User
	// Preload Interests para poder mostrarlos en el frontend
	result := db.Preload("Interests").Limit(50).Find(&users)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al buscar usuarios"})
	}

	// Mapear los intereses a Strings simples para el JSON response
	for idx := range users {
		var interestsList []string
		for _, i := range users[idx].Interests {
			interestsList = append(interestsList, i.Slug)
		}
		users[idx].InterestsList = interestsList
	}

	return c.JSON(users)
}

// --- SEGUIR USUARIO ---
func FollowUser(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id")

	var follow models.Follow
	result := database.DB.Where("follower_id = ? AND following_id = ?", myId, targetId).First(&follow)

	if result.RowsAffected > 0 {
		// Dejar de seguir
		database.DB.Delete(&follow)
		return c.JSON(fiber.Map{"status": "unfollowed"})
	} else {
		// Seguir
		var targetIDUint uint
		var user models.User
		if err := database.DB.First(&user, targetId).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
		}
		targetIDUint = user.ID

		if myId == targetIDUint {
			return c.Status(400).JSON(fiber.Map{"error": "No puedes seguirte a ti mismo"})
		}

		newFollow := models.Follow{FollowerID: myId, FollowingID: targetIDUint, CreatedAt: time.Now()}
		database.DB.Create(&newFollow)

		// 🔔 Crear Notificación
		notif := models.Notification{
			UserID:    targetIDUint,
			SenderID:  myId,
			Type:      "follow",
			Message:   "te ha empezado a seguir",
			CreatedAt: time.Now(),
		}
		database.DB.Create(&notif)

		return c.JSON(fiber.Map{"status": "followed"})
	}
}

// ... RESTO DE FUNCIONES ...

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
	if utf8.RuneCountInString(updateData.Bio) > 1000 {
		return c.Status(400).JSON(fiber.Map{"error": "Bio muy larga"})
	}
	if updateData.Name != "" {
		user.Name = updateData.Name
	}
	user.Bio = updateData.Bio
	if updateData.Gender != "" {
		user.Gender = updateData.Gender
	}
	if updateData.Photos != nil {
		user.Photos = updateData.Photos
		if len(user.Photos) > 0 {
			user.Photo = user.Photos[0]
		}
	} else if updateData.Photo != "" {
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

func DeleteAccount(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var req struct {
		Password string `json:"password"`
	}
	c.BodyParser(&req)
	var user models.User
	database.DB.First(&user, userId)
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "Contraseña incorrecta"})
	}
	database.DB.Where("user_id = ?", userId).Delete(&models.Match{})
	database.DB.Delete(&models.User{}, userId)
	return c.JSON(fiber.Map{"message": "Cuenta eliminada"})
}

func ChangePassword(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	c.BodyParser(&req)
	var user models.User
	database.DB.First(&user, userId)
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "Contraseña incorrecta"})
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 10)
	user.Password = string(hash)
	database.DB.Save(&user)
	return c.JSON(fiber.Map{"message": "Actualizada"})
}
