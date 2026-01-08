package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// DTO para enviar al frontend la previsualización del chat
type ChatPreviewDTO struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Photo       string    `json:"photo"`
	LastMessage string    `json:"last_message"`
	LastTime    time.Time `json:"last_message_time"`
	UnreadCount int64     `json:"unread_count"`
}

// 1. OBTENER MATCHES (Lista de chats)
func GetMatches(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	// A. Buscar coincidencias en la tabla matches
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

	// B. Buscar información de los usuarios amigos
	var friends []models.User
	database.DB.Omit("password").Where("id IN ?", friendIds).Find(&friends)

	// C. Construir la respuesta con último mensaje y contadores
	var results []ChatPreviewDTO

	for _, f := range friends {
		// Buscar el último mensaje entre YO y EL AMIGO
		var lastMsg models.Message
		database.DB.Where(
			"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			myId, f.ID, f.ID, myId,
		).Order("created_at desc").First(&lastMsg)

		// Contar mensajes NO LEÍDOS (donde yo soy el receptor)
		var unread int64
		database.DB.Model(&models.Message{}).
			Where("sender_id = ? AND receiver_id = ? AND is_read = ?", f.ID, myId, false).
			Count(&unread)

		dto := ChatPreviewDTO{
			ID:          f.ID,
			Name:        f.Name,
			Photo:       f.Photo,
			UnreadCount: unread,
		}

		if lastMsg.ID != 0 {
			// Si es imagen, mostramos un texto especial
			if lastMsg.Type == "image" {
				dto.LastMessage = "📷 Foto"
			} else {
				dto.LastMessage = lastMsg.Content
			}
			dto.LastTime = lastMsg.CreatedAt
		} else {
			// Si no hay mensajes, es un match nuevo
			dto.LastMessage = ""
		}

		results = append(results, dto)
	}

	return c.JSON(results)
}

// Estructura para recibir el mensaje desde el frontend
type MessageDTO struct {
	ReceiverID uint   `json:"receiver_id"`
	Content    string `json:"content"`
	Type       string `json:"type"` // "text" o "image"
}

// 2. ENVIAR MENSAJE
func SendMessage(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	var data MessageDTO
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Validar tipo de mensaje (por defecto "text")
	msgType := "text"
	if data.Type == "image" {
		msgType = "image"
	}

	msg := models.Message{
		SenderID:   myId,
		ReceiverID: data.ReceiverID,
		Content:    data.Content,
		Type:       msgType,
		IsRead:     false, // Nace sin leer
	}

	if err := database.DB.Create(&msg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error enviando mensaje"})
	}

	return c.JSON(msg)
}

// 3. OBTENER HISTORIAL DE MENSAJES (Y marcar como leídos)
func GetMessages(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id")

	// A. Marcar como leídos los mensajes que ME enviaron en este chat
	// UPDATE messages SET is_read = true WHERE sender_id = target AND receiver_id = me AND is_read = false
	database.DB.Model(&models.Message{}).
		Where("sender_id = ? AND receiver_id = ? AND is_read = ?", targetId, myId, false).
		Update("is_read", true)

	// B. Obtener historial completo ordenado por fecha
	var messages []models.Message
	database.DB.Where(
		"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		myId, targetId, targetId, myId,
	).Order("created_at asc").Find(&messages)

	return c.JSON(messages)
}

// 4. ELIMINAR MATCH (Bloquear usuario)
func DeleteMatch(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id")

	// Borramos la relación de la tabla matches en ambas direcciones
	result := database.DB.Where(
		"(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		myId, targetId, targetId, myId,
	).Delete(&models.Match{})

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al eliminar match"})
	}

	return c.JSON(fiber.Map{"message": "Match eliminado correctamente"})
}
