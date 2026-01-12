package websockets

import (
	"cuadralo-backend/models"
	"log"
	"strconv"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

// Tipos de mensajes que viajan por el Socket
const (
	TypeMessage     = "new_message"
	TypeOnlineUsers = "online_users"
	TypeUserStatus  = "user_status" // Un usuario se conectó/desconectó
	TypeMsgViewed   = "message_viewed"
	TypeMsgSaved    = "message_saved"
)

// Estructura del paquete WebSocket
type WSMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// Hub mantiene el estado de los clientes conectados
type Hub struct {
	Clients    map[uint]*websocket.Conn // Mapa: UserID -> Conexión
	Register   chan *ClientConnect
	Unregister chan uint
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
	Unregister: make(chan uint),
	Broadcast:  make(chan WSMessage),
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mutex.Lock()
			h.Clients[client.UserID] = client.Conn
			h.Mutex.Unlock()
			log.Printf("Usuario %d conectado", client.UserID)
			h.notifyUserStatus(client.UserID, true)

		case userID := <-h.Unregister:
			h.Mutex.Lock()
			if _, ok := h.Clients[userID]; ok {
				delete(h.Clients, userID)
			}
			h.Mutex.Unlock()
			log.Printf("Usuario %d desconectado", userID)
			h.notifyUserStatus(userID, false)
		}
	}
}

// Notifica a todos (o a los amigos) que alguien cambió su estado
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
	// Enviar a todos los conectados
	h.Mutex.Lock()
	defer h.Mutex.Unlock()
	for _, conn := range h.Clients {
		conn.WriteJSON(msg)
	}
}

// Enviar mensaje privado en tiempo real (Chat)
func SendPrivateMessage(senderID, receiverID uint, msgData models.Message) {
	MainHub.Mutex.Lock()
	recipientConn, ok := MainHub.Clients[receiverID]
	MainHub.Mutex.Unlock()

	// Payload para el socket
	packet := WSMessage{
		Type:    TypeMessage,
		Payload: msgData,
	}

	// 1. Enviar al receptor si está conectado
	if ok {
		if err := recipientConn.WriteJSON(packet); err != nil {
			log.Println("Error enviando WS:", err)
		}
	}

	// 2. Enviar confirmación al remitente
	MainHub.Mutex.Lock()
	senderConn, okSender := MainHub.Clients[senderID]
	MainHub.Mutex.Unlock()
	if okSender {
		senderConn.WriteJSON(packet)
	}
}

// ✅ NUEVO: Función para enviar evento a TODOS (Broadcast)
// Usado para: "new_story"
func BroadcastEvent(eventType string, payload interface{}) {
	packet := WSMessage{
		Type:    eventType,
		Payload: payload,
	}

	MainHub.Mutex.Lock()
	defer MainHub.Mutex.Unlock()

	for _, conn := range MainHub.Clients {
		// Ignoramos errores individuales para no romper el bucle
		conn.WriteJSON(packet)
	}
}

// ✅ NUEVO: Función para enviar evento a UN USUARIO ESPECÍFICO
// Usado para: "story_viewed"
func SendToUser(userIDStr string, eventType string, payload interface{}) {
	// Convertir string ID a uint
	uid, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		log.Println("Error parseando UserID en socket:", err)
		return
	}
	userID := uint(uid)

	MainHub.Mutex.Lock()
	conn, ok := MainHub.Clients[userID]
	MainHub.Mutex.Unlock()

	if ok {
		packet := WSMessage{
			Type:    eventType,
			Payload: payload,
		}
		conn.WriteJSON(packet)
	}
}
