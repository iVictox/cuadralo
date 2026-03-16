package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

type ChatPreviewDTO struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Photo       string    `json:"photo"`
	LastMessage string    `json:"last_message"`
	LastTime    time.Time `json:"last_message_time"`
	UnreadCount int64     `json:"unread_count"`
}

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

	var sender models.User
	if err := database.DB.First(&sender, myId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	var matchCount int64
	database.DB.Model(&models.Match{}).Where(
		"(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		myId, data.ReceiverID, data.ReceiverID, myId,
	).Count(&matchCount)

	// SI NO HAY MATCH, COBRAMOS ROMPEHIELOS Y LO MANDAMOS AL INBOX
	if matchCount == 0 {
		if sender.RompehielosCount <= 0 {
			return c.Status(403).JSON(fiber.Map{
				"error":          "No tienes Rompehielos",
				"needs_purchase": true,
				"message":        "Debes comprar más Rompehielos para chatear sin haber hecho Match.",
			})
		}

		sender.RompehielosCount--
		database.DB.Save(&sender)

		// ✅ CORRECCIÓN: Insertar en la tabla Likes para que aparezca en el Inbox del receptor
		var existingLike models.Like
		errLike := database.DB.Where("from_user_id = ? AND to_user_id = ?", myId, data.ReceiverID).First(&existingLike).Error

		if errLike != nil {
			// No había interacción previa, creamos el rompehielo
			newLike := models.Like{
				FromUserID: myId,
				ToUserID:   data.ReceiverID,
				Action:     "rompehielo",
				Message:    data.Content,
			}
			if data.Type == "image" {
				newLike.Message = "📷 Te ha enviado una foto."
			}
			database.DB.Create(&newLike)
		} else {
			// Ya existía interacción previa, actualizamos el texto para que el Inbox muestre el último mensaje
			existingLike.Action = "rompehielo"
			existingLike.Message = data.Content
			if data.Type == "image" {
				existingLike.Message = "📷 Te ha enviado una foto."
			}
			database.DB.Save(&existingLike)
		}
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
		ExpiresAt:  time.Now().Add(24 * time.Hour),
		Saved:      false,
	}

	if err := database.DB.Create(&msg).Error; err != nil {
		if matchCount == 0 {
			sender.RompehielosCount++
			database.DB.Save(&sender)
		}
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

	msg.Saved = !msg.Saved
	database.DB.Save(&msg)
	return c.JSON(fiber.Map{"saved": msg.Saved, "message": "Estado actualizado"})
}

func DeleteMessage(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	msgId := c.Params("id")

	result := database.DB.Where("id = ? AND sender_id = ?", msgId, myId).Delete(&models.Message{})

	if result.RowsAffected == 0 {
		return c.Status(403).JSON(fiber.Map{"error": "No puedes borrar este mensaje"})
	}

	return c.JSON(fiber.Map{"message": "Eliminado"})
}

func GetMessages(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id")

	database.DB.Model(&models.Message{}).
		Where("sender_id = ? AND receiver_id = ? AND is_read = ?", targetId, myId, false).
		Update("is_read", true)

	var messages []models.Message
	database.DB.Where(
		"((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND (expires_at > ? OR saved = ?)",
		myId, targetId, targetId, myId, time.Now(), true,
	).Order("created_at asc").Find(&messages)

	return c.JSON(messages)
}

func SaveMessage(c *fiber.Ctx) error {
	msgId := c.Params("id")

	var msg models.Message
	if err := database.DB.First(&msg, msgId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Mensaje no encontrado"})
	}

	msg.Saved = true
	database.DB.Save(&msg)

	return c.JSON(fiber.Map{"message": "Mensaje guardado", "saved": true})
}

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

	if err := database.DB.Model(&models.Message{}).Where("id = ?", msgId).Update("is_viewed", true).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al marcar visto"})
	}
	return c.JSON(fiber.Map{"message": "Marcado como visto"})
}
