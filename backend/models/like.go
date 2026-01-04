package models

import "time"

type Like struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	FromUserID uint      `json:"from_user_id"` // Quién da el like
	ToUserID   uint      `json:"to_user_id"`   // A quién se lo da
	Action     string    `json:"action"`       // "like" (derecha) o "dislike" (izquierda)
	CreatedAt  time.Time `json:"created_at"`
}
