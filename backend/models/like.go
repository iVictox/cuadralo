package models

import "time"

type Like struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	FromUserID uint      `json:"from_user_id"`             // Quién da el like
	ToUserID   uint      `json:"to_user_id"`               // A quién se lo da
	Action     string    `json:"action"`                   // "right" (like), "left" (dislike) o "rompehielo"
	Message    string    `json:"message" gorm:"type:text"` // ✅ FASE 3: El texto del rompehielos
	CreatedAt  time.Time `json:"created_at"`
}
