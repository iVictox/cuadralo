package models

import "time"

type User struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Name        string `json:"name"`
	Email       string `json:"email" gorm:"unique"`
	Password    string `json:"-"`
	BirthDate   string `json:"birth_date"`
	Age         int    `json:"age"`
	Gender      string `json:"gender"`
	Photo       string `json:"photo"`
	Bio         string `json:"bio"`
	Interests   string `json:"interests"`
	Preferences string `json:"preferences"`
	IsVerified  bool   `json:"is_verified"`

	// Relaciones (GORM las maneja automáticamente)
	Subscriptions []Subscription `json:"subscriptions,omitempty"`
	Boosts        []Boost        `json:"boosts,omitempty"`

	CreatedAt time.Time `json:"created_at"`
}
