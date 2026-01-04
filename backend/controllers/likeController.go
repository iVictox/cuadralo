package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

	"github.com/gofiber/fiber/v2"
)

type SwipeInput struct {
	TargetID uint   `json:"target_id"`
	Action   string `json:"action"` // "right" (like) o "left" (dislike)
}

func Swipe(c *fiber.Ctx) error {
	// Obtener mi ID (del token). JWT devuelve float64, lo convertimos a uint.
	myIdFloat := c.Locals("userId").(float64)
	myId := uint(myIdFloat)

	var input SwipeInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// 1. Guardar el Swipe (Historial)
	like := models.Like{
		FromUserID: myId,
		ToUserID:   input.TargetID,
		Action:     input.Action,
	}
	database.DB.Create(&like)

	isMatch := false

	// 2. Si fue Like ("right"), verificar si hay MATCH
	if input.Action == "right" {
		var reverseLike models.Like
		// Buscamos si la otra persona YA me dio like a mí antes
		err := database.DB.Where("from_user_id = ? AND to_user_id = ? AND action = 'right'", input.TargetID, myId).First(&reverseLike).Error

		if err == nil {
			// ¡BINGO! Encontró el like de vuelta -> ES UN MATCH
			isMatch = true

			// Crear registro de Match
			match := models.Match{
				User1ID: myId,
				User2ID: input.TargetID,
			}
			database.DB.Create(&match)
		}
	}

	return c.JSON(fiber.Map{
		"message": "Swipe registrado",
		"match":   isMatch, // El frontend usará esto para lanzar confeti
	})
}
