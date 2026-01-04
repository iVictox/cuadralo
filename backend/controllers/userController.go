package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

	"github.com/gofiber/fiber/v2"
)

// GetMe devuelve los datos del usuario logueado
func GetMe(c *fiber.Ctx) error {
	// Recuperamos el ID que el middleware guardó en el contexto
	userId := c.Locals("userId")

	var user models.User

	// Buscamos el usuario por ID, omitiendo la contraseña
	if err := database.DB.Omit("password").First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	return c.JSON(user)
}

// GetFeed: Devuelve usuarios que AÚN NO he visto
func GetFeed(c *fiber.Ctx) error {
	myIdFloat := c.Locals("userId").(float64)
	myId := uint(myIdFloat)

	// 1. Buscar IDs de personas a las que YA les di swipe
	var swipedIds []uint
	database.DB.Model(&models.Like{}).Where("from_user_id = ?", myId).Pluck("to_user_id", &swipedIds)

	// 2. Buscar usuarios (excluyéndome a mí Y a los swipedIds)
	var users []models.User
	query := database.DB.Omit("password").Where("id != ?", myId)

	if len(swipedIds) > 0 {
		query = query.Where("id NOT IN ?", swipedIds)
	}

	result := query.Limit(20).Find(&users)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando feed"})
	}

	return c.JSON(users)
}
