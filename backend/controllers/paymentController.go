package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

type PurchaseInput struct {
	Item string `json:"item"` // "silver", "gold", "platinum", "destello"
}

func PurchasePlan(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	var input PurchaseInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	now := time.Now()

	// CASO 1: COMPRA DE PLAN (SUSCRIPCIÓN)
	if input.Item == "silver" || input.Item == "gold" || input.Item == "platinum" {
		// Desactivar suscripciones anteriores activas para evitar conflictos
		database.DB.Model(&models.Subscription{}).
			Where("user_id = ? AND status = 'active'", myId).
			Update("status", "cancelled")

		// Crear nueva suscripción
		sub := models.Subscription{
			UserID:    myId,
			Plan:      input.Item,
			StartDate: now,
			EndDate:   now.AddDate(0, 1, 0), // +1 Mes
			Status:    "active",
			CreatedAt: now,
		}
		database.DB.Create(&sub)

		return c.JSON(fiber.Map{"message": "Suscripción activada", "plan": input.Item})
	}

	// CASO 2: COMPRA DE DESTELLO (BOOST)
	if input.Item == "destello" {
		boost := models.Boost{
			UserID:    myId,
			ExpiresAt: now.Add(30 * time.Minute), // +30 Minutos
			CreatedAt: now,
		}
		database.DB.Create(&boost)

		return c.JSON(fiber.Map{"message": "Destello activado por 30 min"})
	}

	return c.Status(400).JSON(fiber.Map{"error": "Producto desconocido"})
}
