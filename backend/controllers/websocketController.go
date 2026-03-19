package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/websockets"
	"encoding/json"
	"log"
	"strconv"
	"time"

	"github.com/gofiber/contrib/websocket"
)

func HandleWebSocket(c *websocket.Conn) {
	userIdStr := c.Params("id")
	userId, _ := strconv.Atoi(userIdStr)
	uID := uint(userId)

	websockets.MainHub.Register <- &websockets.ClientConnect{UserID: uID, Conn: c}
	defer func() {
		websockets.MainHub.Unregister <- &websockets.ClientDisconnect{UserID: uID, Conn: c}
		c.Close()
	}()

	pongWait := 60 * time.Second

	for {
		c.SetReadDeadline(time.Now().Add(pongWait))

		_, msg, err := c.ReadMessage()
		if err != nil {
			break
		}

		var incoming struct {
			Type    string          `json:"type"`
			Payload json.RawMessage `json:"payload"`
		}

		if err := json.Unmarshal(msg, &incoming); err != nil {
			log.Println("Error parseando JSON socket:", err)
			continue
		}

		switch incoming.Type {
		case "ping":
			continue

		case "send_message":
			var msgData models.Message
			json.Unmarshal(incoming.Payload, &msgData)

			msgData.SenderID = uID
			msgData.CreatedAt = time.Now()
			database.DB.Create(&msgData)

			websockets.SendPrivateMessage(uID, msgData.ReceiverID, msgData)

		// ✅ NUEVO: Marcar chat como leído en tiempo real
		case "mark_chat_read":
			var payload struct {
				ChatID uint `json:"chat_id"`
			}
			json.Unmarshal(incoming.Payload, &payload)

			// Actualizar en base de datos
			database.DB.Model(&models.Message{}).
				Where("sender_id = ? AND receiver_id = ? AND is_read = ?", payload.ChatID, uID, false).
				Update("is_read", true)

			// Avisar al remitente que sus mensajes fueron leídos (para el doble check azul)
			websockets.SendToUser(strconv.Itoa(int(payload.ChatID)), "messages_read", map[string]interface{}{
				"chat_id": uID,
			})

		case "view_once_opened":
			var payload struct {
				MessageID uint `json:"message_id"`
			}
			json.Unmarshal(incoming.Payload, &payload)
			database.DB.Model(&models.Message{}).Where("id = ?", payload.MessageID).Update("is_viewed", true)

		case "save_message":
			var payload struct {
				MessageID uint `json:"message_id"`
				IsSaved   bool `json:"is_saved"`
			}
			json.Unmarshal(incoming.Payload, &payload)
			database.DB.Model(&models.Message{}).Where("id = ?", payload.MessageID).Update("is_saved", payload.IsSaved)
		}
	}
}
