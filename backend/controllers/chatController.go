package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

	"github.com/gofiber/fiber/v2"
)

// --- 1. Obtener mis Matches (La lista de chats) ---
func GetMatches(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	// Buscamos todos los matches donde yo soy User1 o User2
	var matches []models.Match
	database.DB.Where("user1_id = ? OR user2_id = ?", myId, myId).Find(&matches)

	// Extraemos los IDs de las OTRAS personas
	var friendIds []uint
	for _, m := range matches {
		if m.User1ID == myId {
			friendIds = append(friendIds, m.User2ID)
		} else {
			friendIds = append(friendIds, m.User1ID)
		}
	}

	// Si no hay matches, devolvemos array vacío
	if len(friendIds) == 0 {
		return c.JSON([]models.User{})
	}

	// Buscamos los datos de esos usuarios
	var friends []models.User
	database.DB.Omit("password").Where("id IN ?", friendIds).Find(&friends)

	return c.JSON(friends)
}

// --- 2. Enviar Mensaje ---
type MessageDTO struct {
	ReceiverID uint   `json:"receiver_id"`
	Content    string `json:"content"`
}

func SendMessage(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	var data MessageDTO
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Crear mensaje
	msg := models.Message{
		SenderID:   myId,
		ReceiverID: data.ReceiverID,
		Content:    data.Content,
	}

	if err := database.DB.Create(&msg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error enviando mensaje"})
	}

	return c.JSON(msg)
}

// --- 3. Obtener Historial de Chat con alguien ---
func GetMessages(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id") // El ID de la otra persona viene en la URL

	var messages []models.Message

	// Buscar mensajes donde:
	// (Yo soy emisor Y él receptor) O (Él es emisor Y yo receptor)
	// Ordenados por fecha
	database.DB.Where(
		"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		myId, targetId, targetId, myId,
	).Order("created_at asc").Find(&messages)

	return c.JSON(messages)
}
