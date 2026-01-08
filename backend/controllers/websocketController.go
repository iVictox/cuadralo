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

// HandleWebSocket gestiona la conexión individual de cada usuario
func HandleWebSocket(c *websocket.Conn) {
	// Obtener ID del usuario desde params o locals (middleware previo)
	userIdStr := c.Params("id")
	userId, _ := strconv.Atoi(userIdStr)
	uID := uint(userId)

	// Registrar en el Hub
	websockets.MainHub.Register <- &websockets.ClientConnect{UserID: uID, Conn: c}

	defer func() {
		websockets.MainHub.Unregister <- uID
		c.Close()
	}()

	// Loop principal de escucha de mensajes desde el Cliente
	for {
		_, msg, err := c.ReadMessage()
		if err != nil {
			break
		}

		// Parsear mensaje entrante
		var incoming struct {
			Type    string          `json:"type"`
			Payload json.RawMessage `json:"payload"`
		}

		if err := json.Unmarshal(msg, &incoming); err != nil {
			log.Println("Error parseando JSON socket:", err)
			continue
		}

		switch incoming.Type {
		case "send_message":
			var msgData models.Message
			json.Unmarshal(incoming.Payload, &msgData)

			// Forzar IDs correctos y defaults
			msgData.SenderID = uID
			msgData.CreatedAt = time.Now()

			// Guardar en BD
			database.DB.Create(&msgData)

			// Enviar por Socket
			websockets.SendPrivateMessage(uID, msgData.ReceiverID, msgData)

		case "view_once_opened":
			// El cliente avisa que abrió una foto efímera
			var payload struct {
				MessageID uint `json:"message_id"`
			}
			json.Unmarshal(incoming.Payload, &payload)

			// Marcar como visto en BD
			database.DB.Model(&models.Message{}).Where("id = ?", payload.MessageID).Update("is_viewed", true)

		case "save_message":
			// Toggle para guardar mensaje (evitar borrado 24h)
			var payload struct {
				MessageID uint `json:"message_id"`
				IsSaved   bool `json:"is_saved"`
			}
			json.Unmarshal(incoming.Payload, &payload)

			database.DB.Model(&models.Message{}).Where("id = ?", payload.MessageID).Update("is_saved", payload.IsSaved)

			// Notificar al otro usuario que el mensaje fue guardado (opcional, estilo Snapchat)
			// ...
		}
	}
}
