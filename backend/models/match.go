package models

import "time"

type Match struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	User1ID   uint      `json:"user1_id"`
	User2ID   uint      `json:"user2_id"`
	CreatedAt time.Time `json:"created_at"`
}
