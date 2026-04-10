package models

import "time"

type Match struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	User1ID   uint      `json:"user1_id"`
	User1     User      `gorm:"foreignKey:User1ID" json:"user1"` // ✅ Relación Añadida
	User2ID   uint      `json:"user2_id"`
	User2     User      `gorm:"foreignKey:User2ID" json:"user2"` // ✅ Relación Añadida
	CreatedAt time.Time `json:"created_at"`
}
