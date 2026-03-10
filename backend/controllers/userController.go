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

	user.InterestsList = []string{}
	for _, i := range user.Interests {
		user.InterestsList = append(user.InterestsList, i.Slug)
	}
	return c.JSON(user)
}

func UpdateMe(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var user models.User
	database.DB.First(&user, userId)

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

	if input.Interests != nil {
		var newInterests []models.Interest
		database.DB.Where("slug IN ?", input.Interests).Find(&newInterests)
		database.DB.Model(&user).Association("Interests").Replace(newInterests)
	}

	database.DB.Save(&user)
	return c.JSON(user)
}

func GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User
	if err := database.DB.Preload("Interests").First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No encontrado"})
	}
	return c.JSON(user)
}

func DeleteAccount(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	database.DB.Delete(&models.User{}, userId)
	return c.JSON(fiber.Map{"message": "Cuenta eliminada"})
}

func ChangePassword(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var data map[string]string
	c.BodyParser(&data)
	newPassword, _ := bcrypt.GenerateFromPassword([]byte(data["password"]), 14)
	database.DB.Model(&models.User{}).Where("id = ?", userId).Update("password", string(newPassword))
	return c.JSON(fiber.Map{"message": "Contraseña actualizada"})
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
