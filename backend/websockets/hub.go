package websockets

import (
	"cuadralo-backend/models"
	"log"
	"strconv"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
)

const (
	TypeMessage     = "new_message"
	TypeOnlineUsers = "online_users"
	TypeUserStatus  = "user_status"
	TypeMsgViewed   = "message_viewed"
	TypeMsgSaved    = "message_saved"
)

type WSMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// NUEVO: Estructura para desconectar con seguridad
type ClientDisconnect struct {
	UserID uint
	Conn   *websocket.Conn
}

type Hub struct {
	Clients    map[uint]*websocket.Conn
	Register   chan *ClientConnect
	Unregister chan *ClientDisconnect // Usamos la nueva estructura
	Broadcast  chan WSMessage
	Mutex      sync.Mutex
}

type ClientConnect struct {
	UserID uint
	Conn   *websocket.Conn
}

var MainHub = Hub{
	Clients:    make(map[uint]*websocket.Conn),
	Register:   make(chan *ClientConnect),
	Unregister: make(chan *ClientDisconnect),
	Broadcast:  make(chan WSMessage),
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mutex.Lock()
			h.Clients[client.UserID] = client.Conn

			var onlineUserIDs []uint
			for uid := range h.Clients {
				onlineUserIDs = append(onlineUserIDs, uid)
			}
			h.Mutex.Unlock()

			log.Printf("Usuario %d conectado", client.UserID)

			msgList := WSMessage{
				Type:    TypeOnlineUsers,
				Payload: onlineUserIDs,
			}

			// Límite de tiempo para evitar congelar el hilo
			client.Conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
			if err := client.Conn.WriteJSON(msgList); err != nil {
				log.Println("Error enviando lista inicial de online:", err)
			}

			h.notifyUserStatus(client.UserID, true)

		case client := <-h.Unregister:
			h.Mutex.Lock()
			// ✅ SOLUCIÓN: Solo borramos del mapa si la conexión que se cierra es la ACTUAL.
			// Evita que un F5/Recarga rápida borre la nueva conexión activa.
			if conn, ok := h.Clients[client.UserID]; ok && conn == client.Conn {
				delete(h.Clients, client.UserID)
				h.Mutex.Unlock() // Soltamos el Mutex rápido
				log.Printf("Usuario %d desconectado", client.UserID)
				h.notifyUserStatus(client.UserID, false)
			} else {
				h.Mutex.Unlock()
			}
		}
	}
}

func (h *Hub) notifyUserStatus(userID uint, isOnline bool) {
	status := "offline"
	if isOnline {
		status = "online"
	}
	msg := WSMessage{
		Type: TypeUserStatus,
		Payload: map[string]interface{}{
			"user_id": userID,
			"status":  status,
		},
	}

	// ✅ SOLUCIÓN: Copiamos los clientes y soltamos el Mutex.
	// Si un WriteJSON se bloquea por internet lento de un cliente, no congela a todo el servidor.
	h.Mutex.Lock()
	clientsCopy := make(map[uint]*websocket.Conn)
	for k, v := range h.Clients {
		clientsCopy[k] = v
	}
	h.Mutex.Unlock()

	for _, conn := range clientsCopy {
		conn.SetWriteDeadline(time.Now().Add(3 * time.Second))
		conn.WriteJSON(msg)
	}
}

func SendPrivateMessage(senderID, receiverID uint, msgData models.Message) {
	MainHub.Mutex.Lock()
	recipientConn, ok := MainHub.Clients[receiverID]
	senderConn, okSender := MainHub.Clients[senderID]
	MainHub.Mutex.Unlock()

	packet := WSMessage{
		Type:    TypeMessage,
		Payload: msgData,
	}

	if ok {
		recipientConn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		if err := recipientConn.WriteJSON(packet); err != nil {
			log.Println("Error enviando WS:", err)
		}
	}

	if okSender {
		senderConn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		senderConn.WriteJSON(packet)
	}
}

func BroadcastEvent(eventType string, payload interface{}) {
	packet := WSMessage{
		Type:    eventType,
		Payload: payload,
	}

	MainHub.Mutex.Lock()
	clientsCopy := make(map[uint]*websocket.Conn)
	for k, v := range MainHub.Clients {
		clientsCopy[k] = v
	}
	MainHub.Mutex.Unlock()

	for _, conn := range clientsCopy {
		conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		conn.WriteJSON(packet)
	}
}

func SendToUser(userIDStr string, eventType string, payload interface{}) {
	uid, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		return
	}
	userID := uint(uid)

	MainHub.Mutex.Lock()
	conn, ok := MainHub.Clients[userID]
	MainHub.Mutex.Unlock()

	if ok {
		conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		conn.WriteJSON(WSMessage{Type: eventType, Payload: payload})
	}
}
