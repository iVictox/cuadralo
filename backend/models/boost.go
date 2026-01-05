package models

import (
	"time"
)

type Boost struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	ExpiresAt time.Time `json:"expires_at"` // Cuándo se apaga el destello
	CreatedAt time.Time `json:"created_at"`
}
