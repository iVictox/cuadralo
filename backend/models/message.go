package models

import "time"

type Message struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	SenderID   uint   `json:"sender_id"`
	Sender     User   `gorm:"foreignKey:SenderID" json:"sender"` // ✅ Relación añadida
	ReceiverID uint   `json:"receiver_id"`
	Receiver   User   `gorm:"foreignKey:ReceiverID" json:"receiver"` // ✅ Relación añadida
	Content    string `json:"content"`

	// Type puede ser: "text", "image", "screenshot_alert"
	Type   string `json:"type" gorm:"default:'text'"`
	IsRead bool   `json:"is_read" gorm:"default:false"`

	// Nuevo campo para saber si la foto efímera ya se abrió
	IsViewed bool `json:"is_viewed" gorm:"default:false"`

	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
	Saved     bool      `json:"saved" gorm:"default:false"`
}
