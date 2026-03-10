package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

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
		Name      string   `json:"name"`
		Bio       string   `json:"bio"`
		Location  string   `json:"location"`
		Photos    []string `json:"photos"`
		Interests []string `json:"interests"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if input.Name != "" {
		user.Name = input.Name
	}
	user.Bio = input.Bio
	user.Location = input.Location

	if input.Photos != nil {
		user.Photos = input.Photos
		if len(input.Photos) > 0 {
			user.Photo = input.Photos[0]
		}
	}

	database.DB.Save(&user)

	// ✅ MAGIA DE INTERESES (A prueba de balas)
	if input.Interests != nil {
		var newInterests []models.Interest

		for _, slug := range input.Interests {
			var interest models.Interest

			// Buscamos
			result := database.DB.Where("slug = ?", slug).First(&interest)

			// Si no existe, lo forzamos a crearse
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

		// Reemplazamos todos los intereses anteriores por los nuevos
		database.DB.Model(&user).Association("Interests").Replace(newInterests)
	}

	// Recargamos al usuario
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

func GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User
	if err := database.DB.Preload("Interests").First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No encontrado"})
	}

	user.InterestsList = []string{}
	for _, i := range user.Interests {
		user.InterestsList = append(user.InterestsList, i.Slug)
	}

	return c.JSON(user)
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

	// Verificar vieja
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Contraseña actual incorrecta"})
	}

	// Encriptar nueva con costo 14 (idéntico al registro)
	hashed, _ := bcrypt.GenerateFromPassword([]byte(data.NewPassword), 14)

	database.DB.Model(&user).Update("password", string(hashed))
	return c.JSON(fiber.Map{"message": "Contraseña cambiada"})
}

func DeleteAccount(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	tx := database.DB.Begin()
	// Limpieza total
	tx.Where("user_id = ?", userId).Delete(&models.Post{})
	tx.Where("follower_id = ? OR following_id = ?", userId, userId).Delete(&models.Follow{})
	tx.Where("from_user_id = ? OR to_user_id = ?", userId, userId).Delete(&models.Like{})
	tx.Delete(&models.User{}, userId)
	tx.Commit()
	return c.JSON(fiber.Map{"message": "Adiós"})
}

func SearchUsers(c *fiber.Ctx) error {
	query := c.Query("q")
	var users []models.User
	database.DB.Where("name ILIKE ? OR username ILIKE ?", "%"+query+"%", "%"+query+"%").Limit(20).Find(&users)
	return c.JSON(users)
}

func GetAllInterests(c *fiber.Ctx) error {
	var interests []models.Interest
	database.DB.Find(&interests)
	return c.JSON(interests)
}
