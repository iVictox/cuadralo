package websockets

import (
	"log"
	"sync"

	"cuadralo-backend/models"

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
	// En una app real, aquí filtraríamos para enviar solo a los "matches" de ese usuario
	// Por simplicidad, enviamos broadcast o dejamos que el cliente actualice
	// Para este ejemplo, enviaremos a todos los conectados (broadcast simple)
	for _, conn := range h.Clients {
		conn.WriteJSON(msg)
	}
}

// Enviar mensaje privado en tiempo real
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

	// 2. Enviar confirmación al remitente (para que aparezca en su chat UI instantáneamente si usa sockets)
	// Aunque el frontend suele añadirlo optimísticamente, esto asegura sincronía.
	MainHub.Mutex.Lock()
	senderConn, okSender := MainHub.Clients[senderID]
	MainHub.Mutex.Unlock()
	if okSender {
		senderConn.WriteJSON(packet)
	}
}
