package models

import (
	"time"
)

type Subscription struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	Plan      string    `json:"plan"` // "silver", "gold", "platinum"
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	Status    string    `json:"status"` // "active", "expired"
	CreatedAt time.Time `json:"created_at"`
}
