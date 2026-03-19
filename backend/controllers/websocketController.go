package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/websockets"
	"encoding/json"
	"log"
	"strconv"
	"time" // <-- Asegúrate de importar time

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
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

	// Definimos el tiempo máximo que esperaremos un mensaje del cliente
	pongWait := 60 * time.Second

	for {
		// Renueva el contador cada vez que el ciclo vuelve a empezar
		c.SetReadDeadline(time.Now().Add(pongWait))

		_, msg, err := c.ReadMessage()
		if err != nil {
			// Si no hay mensajes en 60 seg, o el proxy corta la conexión, err no será nil
			// El loop se rompe, se ejecuta el defer, y el usuario pasa a "offline"
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
			// El cliente enviará un ping constantemente.
			// No necesitamos hacer nada extra, al recibir este mensaje
			// el loop vuelve arriba y renueva el SetReadDeadline de 60 segundos.
			continue

		case "send_message":
			var msgData models.Message
			json.Unmarshal(incoming.Payload, &msgData)

			msgData.SenderID = uID
			msgData.CreatedAt = time.Now()
			database.DB.Create(&msgData)

			websockets.SendPrivateMessage(uID, msgData.ReceiverID, msgData)

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

// Agregar al final de backend/controllers/websocketController.go

func DebugWebSockets(c *fiber.Ctx) error {
	websockets.MainHub.Mutex.Lock()
	defer websockets.MainHub.Mutex.Unlock()

	var onlineUsers []uint
	for uid := range websockets.MainHub.Clients {
		onlineUsers = append(onlineUsers, uid)
	}

	return c.JSON(fiber.Map{
		"total_conectados": len(onlineUsers),
		"usuarios_ids":     onlineUsers,
		"mensaje":          "Esta es la memoria RAM real del servidor en este momento",
	})
}
