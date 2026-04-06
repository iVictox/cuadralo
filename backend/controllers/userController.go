package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"encoding/json"
	"strings"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func GetMe(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var user models.User

	if err := database.DB.Preload("Interests").First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	var followersCount, followingCount int64
	database.DB.Model(&models.Follow{}).Where("following_id = ?", user.ID).Count(&followersCount)
	database.DB.Model(&models.Follow{}).Where("follower_id = ?", user.ID).Count(&followingCount)
	user.FollowersCount = int(followersCount)
	user.FollowingCount = int(followingCount)

	user.InterestsList = []string{}
	for _, i := range user.Interests {
		user.InterestsList = append(user.InterestsList, i.Slug)
	}

	return c.JSON(user)
}

func UpdateMe(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var user models.User

	if err := database.DB.Preload("Interests").First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	var input struct {
		Name        string                 `json:"name"`
		Username    string                 `json:"username"`
		Bio         string                 `json:"bio"`
		Location    string                 `json:"location"`
		Photos      []string               `json:"photos"`
		Interests   []string               `json:"interests"`
		Preferences map[string]interface{} `json:"preferences"` // ✅ AÑADIDO: Para guardar los filtros
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if input.Name != "" {
		user.Name = input.Name
	}

	if input.Username != "" {
		user.Username = strings.ToLower(strings.ReplaceAll(input.Username, " ", ""))
	}

	user.Bio = input.Bio
	user.Location = input.Location

	if input.Photos != nil {
		user.Photos = input.Photos
		if len(input.Photos) > 0 {
			user.Photo = input.Photos[0]
		}
	}

	// ✅ AÑADIDO: Guardar las preferencias como String JSON
	if input.Preferences != nil {
		prefsBytes, _ := json.Marshal(input.Preferences)
		user.Preferences = string(prefsBytes)
	}

	if err := database.DB.Save(&user).Error; err != nil {
		if strings.Contains(err.Error(), "username") {
			return c.Status(400).JSON(fiber.Map{"error": "Ese nombre de usuario ya está ocupado."})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Error al guardar el perfil"})
	}

	if input.Interests != nil {
		var newInterests []models.Interest

		for _, slug := range input.Interests {
			var interest models.Interest
			result := database.DB.Where("slug = ?", slug).First(&interest)

			if result.RowsAffected == 0 {
				interest = models.Interest{
					Name:     slug,
					Slug:     slug,
					Category: "General",
				}
				database.DB.Create(&interest)
			}

			newInterests = append(newInterests, interest)
		}
		database.DB.Model(&user).Association("Interests").Replace(newInterests)
	}

	database.DB.Preload("Interests").First(&user, userId)

	var followersCount, followingCount int64
	database.DB.Model(&models.Follow{}).Where("following_id = ?", user.ID).Count(&followersCount)
	database.DB.Model(&models.Follow{}).Where("follower_id = ?", user.ID).Count(&followingCount)
	user.FollowersCount = int(followersCount)
	user.FollowingCount = int(followingCount)

	user.InterestsList = []string{}
	for _, i := range user.Interests {
		user.InterestsList = append(user.InterestsList, i.Slug)
	}

	return c.JSON(user)
}

// ✅ CORRECCIÓN APLICADA: Ahora GetUser también comprueba y envía si es un match
func GetUser(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	id := c.Params("id")
	var user models.User

	if err := database.DB.Preload("Interests").First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No encontrado"})
	}

	user.InterestsList = []string{}
	for _, i := range user.Interests {
		user.InterestsList = append(user.InterestsList, i.Slug)
	}

	// Comprobar si ya son un Match oficial
	var match models.Match
	isMatch := false
	if database.DB.Where("(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)", myId, user.ID, user.ID, myId).First(&match).RowsAffected > 0 {
		isMatch = true
	}

	return c.JSON(fiber.Map{
		"id":               user.ID,
		"name":             user.Name,
		"username":         user.Username,
		"bio":              user.Bio,
		"gender":           user.Gender,
		"birth_date":       user.BirthDate,
		"location":         user.Location,
		"photo":            user.Photo,
		"photos":           user.Photos,
		"followers_count":  user.FollowersCount,
		"following_count":  user.FollowingCount,
		"is_prime":         user.IsPrime,
		"interestsList":    user.InterestsList,
		"is_following":     user.IsFollowing,
		"has_story":        user.HasStory,
		"has_unseen_story": user.HasUnseenStory,
		"is_match":         isMatch, // <- Enviamos si es match o no
	})
}

func ChangePassword(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var data struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var user models.User
	database.DB.First(&user, userId)

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Contraseña actual incorrecta"})
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(data.NewPassword), 14)

	database.DB.Model(&user).Update("password", string(hashed))
	return c.JSON(fiber.Map{"message": "Contraseña cambiada"})
}

func DeleteAccount(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	tx := database.DB.Begin()
	tx.Where("user_id = ?", userId).Delete(&models.Post{})
	tx.Where("follower_id = ? OR following_id = ?", userId, userId).Delete(&models.Follow{})
	tx.Where("from_user_id = ? OR to_user_id = ?", userId, userId).Delete(&models.Like{})
	tx.Delete(&models.User{}, userId)
	tx.Commit()
	return c.JSON(fiber.Map{"message": "Adiós"})
}

func SearchUsers(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.JSON([]models.User{})
	}

	var users []models.User
	searchTerm := "%" + query + "%"

	database.DB.Select("id, name, username, photo").
		Where("LOWER(name) LIKE LOWER(?) OR LOWER(username) LIKE LOWER(?)", searchTerm, searchTerm).
		Limit(20).
		Find(&users)

	return c.JSON(users)
}

func GetAllInterests(c *fiber.Ctx) error {
	var interests []models.Interest
	database.DB.Find(&interests)
	return c.JSON(interests)
}
