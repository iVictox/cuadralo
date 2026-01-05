package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// DTO para enviar al frontend
type ChatPreviewDTO struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Photo       string    `json:"photo"`
	LastMessage string    `json:"last_message"`
	LastTime    time.Time `json:"last_message_time"`
	UnreadCount int64     `json:"unread_count"`
}

// 1. Obtener Matches
func GetMatches(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	var matches []models.Match
	database.DB.Where("user1_id = ? OR user2_id = ?", myId, myId).Find(&matches)

	var friendIds []uint
	for _, m := range matches {
		if m.User1ID == myId {
			friendIds = append(friendIds, m.User2ID)
		} else {
			friendIds = append(friendIds, m.User1ID)
		}
	}

	if len(friendIds) == 0 {
		return c.JSON([]ChatPreviewDTO{})
	}

	var friends []models.User
	database.DB.Omit("password").Where("id IN ?", friendIds).Find(&friends)

	var results []ChatPreviewDTO
	for _, f := range friends {
		var lastMsg models.Message
		database.DB.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", myId, f.ID, f.ID, myId).Order("created_at desc").First(&lastMsg)

		var unread int64
		database.DB.Model(&models.Message{}).Where("sender_id = ? AND receiver_id = ? AND is_read = ?", f.ID, myId, false).Count(&unread)

		dto := ChatPreviewDTO{ID: f.ID, Name: f.Name, Photo: f.Photo, UnreadCount: unread}
		if lastMsg.ID != 0 {
			dto.LastMessage = lastMsg.Content
			dto.LastTime = lastMsg.CreatedAt
		}
		results = append(results, dto)
	}
	return c.JSON(results)
}

// 2. Enviar Mensaje
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

	msg := models.Message{SenderID: myId, ReceiverID: data.ReceiverID, Content: data.Content, IsRead: false}
	if err := database.DB.Create(&msg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error enviando"})
	}
	return c.JSON(msg)
}

// 3. Obtener Historial
func GetMessages(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id")

	database.DB.Model(&models.Message{}).Where("sender_id = ? AND receiver_id = ? AND is_read = ?", targetId, myId, false).Update("is_read", true)

	var messages []models.Message
	database.DB.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", myId, targetId, targetId, myId).Order("created_at asc").Find(&messages)
	return c.JSON(messages)
}

// 4. ELIMINAR MATCH (BLOQUEAR) - ¡NUEVO!
func DeleteMatch(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id")

	// Borramos la relación de la tabla matches
	result := database.DB.Where(
		"(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		myId, targetId, targetId, myId,
	).Delete(&models.Match{})

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al eliminar match"})
	}

	return c.JSON(fiber.Map{"message": "Match eliminado correctamente"})
}
