package models

import "time"

type Message struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	SenderID   uint      `json:"sender_id"`
	ReceiverID uint      `json:"receiver_id"`
	Content    string    `json:"content"`
	IsRead     bool      `json:"is_read" gorm:"default:false"` // <--- ESTO ES CRUCIAL
	CreatedAt  time.Time `json:"created_at"`
}
