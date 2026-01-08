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
		// Buscar ultimo mensaje, ignorando los expirados no guardados
		// (expires_at > NOW OR saved = true)
		database.DB.Where(
			"((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND (expires_at > ? OR saved = ?)",
			myId, f.ID, f.ID, myId, time.Now(), true,
		).Order("created_at desc").First(&lastMsg)

		var unread int64
		database.DB.Model(&models.Message{}).
			Where("sender_id = ? AND receiver_id = ? AND is_read = ? AND (expires_at > ? OR saved = ?)",
				f.ID, myId, false, time.Now(), true).
			Count(&unread)

		dto := ChatPreviewDTO{
			ID:          f.ID,
			Name:        f.Name,
			Photo:       f.Photo,
			UnreadCount: unread,
		}

		if lastMsg.ID != 0 {
			if lastMsg.Type == "image" {
				dto.LastMessage = "📷 Foto"
			} else {
				dto.LastMessage = lastMsg.Content
			}
			dto.LastTime = lastMsg.CreatedAt
		} else {
			dto.LastMessage = ""
		}

		results = append(results, dto)
	}

	return c.JSON(results)
}

type MessageDTO struct {
	ReceiverID uint   `json:"receiver_id"`
	Content    string `json:"content"`
	Type       string `json:"type"`
}

// 2. ENVIAR MENSAJE (Default 24h)
func SendMessage(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	var data struct {
		ReceiverID uint   `json:"receiver_id"`
		Content    string `json:"content"`
		Type       string `json:"type"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	msgType := "text"
	if data.Type == "image" {
		msgType = "image"
	}

	msg := models.Message{
		SenderID:   myId,
		ReceiverID: data.ReceiverID,
		Content:    data.Content,
		Type:       msgType,
		IsRead:     false,
		ExpiresAt:  time.Now().Add(24 * time.Hour), // 24H por defecto
		Saved:      false,
	}

	if err := database.DB.Create(&msg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error enviando"})
	}
	return c.JSON(msg)
}

func ToggleMessageSave(c *fiber.Ctx) error {
	msgId := c.Params("id")

	var msg models.Message
	if err := database.DB.First(&msg, msgId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Mensaje no encontrado"})
	}

	// Invertir estado
	msg.Saved = !msg.Saved

	// Si se guarda, extendemos expiración (opcional, para que no se borre de la DB por cronjob si lo hubiera)
	if msg.Saved {
		// msg.ExpiresAt = time.Now().Add(100 * 365 * 24 * time.Hour) // Opcional
	}

	database.DB.Save(&msg)
	return c.JSON(fiber.Map{"saved": msg.Saved, "message": "Estado actualizado"})
}

func DeleteMessage(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	msgId := c.Params("id")

	// Borramos solo si soy el dueño o el receptor (según tu lógica, usualmente el sender borra)
	// Aquí permitimos borrar si soy el Sender
	result := database.DB.Where("id = ? AND sender_id = ?", msgId, myId).Delete(&models.Message{})

	if result.RowsAffected == 0 {
		return c.Status(403).JSON(fiber.Map{"error": "No puedes borrar este mensaje"})
	}

	return c.JSON(fiber.Map{"message": "Eliminado"})
}

// 3. OBTENER HISTORIAL (Filtrando expirados)
func GetMessages(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id")

	// Marcar como leídos
	database.DB.Model(&models.Message{}).
		Where("sender_id = ? AND receiver_id = ? AND is_read = ?", targetId, myId, false).
		Update("is_read", true)

	// Obtener mensajes QUE NO HAN EXPIRADO o ESTÁN GUARDADOS
	var messages []models.Message
	database.DB.Where(
		"((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND (expires_at > ? OR saved = ?)",
		myId, targetId, targetId, myId, time.Now(), true,
	).Order("created_at asc").Find(&messages)

	return c.JSON(messages)
}

// 4. GUARDAR MENSAJE
func SaveMessage(c *fiber.Ctx) error {
	// myId := uint(c.Locals("userId").(float64)) // Podríamos validar si el usuario pertenece al chat
	msgId := c.Params("id")

	var msg models.Message
	if err := database.DB.First(&msg, msgId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Mensaje no encontrado"})
	}

	// Marcar como guardado (ya no expira)
	msg.Saved = true
	// Opcional: Podrías extender la fecha de expiración a 100 años
	// msg.ExpiresAt = time.Now().Add(876000 * time.Hour)

	database.DB.Save(&msg)

	return c.JSON(fiber.Map{"message": "Mensaje guardado", "saved": true})
}

// 5. ELIMINAR MATCH
func DeleteMatch(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id")

	result := database.DB.Where(
		"(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		myId, targetId, targetId, myId,
	).Delete(&models.Match{})

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al eliminar match"})
	}

	return c.JSON(fiber.Map{"message": "Match eliminado correctamente"})
}

func MarkMessageViewed(c *fiber.Ctx) error {
	msgId := c.Params("id")

	// UPDATE messages SET is_viewed = true WHERE id = ?
	if err := database.DB.Model(&models.Message{}).Where("id = ?", msgId).Update("is_viewed", true).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al marcar visto"})
	}
	return c.JSON(fiber.Map{"message": "Marcado como visto"})
}
