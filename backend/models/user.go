package models

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	Email     string `gorm:"unique" json:"email"`
	Password  string `json:"-"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	BirthDate string `json:"birth_date"`
	Photo     string `json:"photo"`
	Bio       string `json:"bio"`

	// RELACIÓN MANY-TO-MANY
	Interests []Interest `gorm:"many2many:user_interests;" json:"interests_obj"`

	// Campo virtual para compatibilidad JSON (lo usaremos en los controllers)
	InterestsList []string `gorm:"-" json:"interests"`

	Preferences string `json:"preferences"` // JSON string

	// Relaciones existentes
	Likes         []Like         `gorm:"foreignKey:FromUserID"`
	Matches       []Match        `gorm:"foreignKey:User1ID"`
	Subscriptions []Subscription `gorm:"foreignKey:UserID"`
	Boosts        []Boost        `gorm:"foreignKey:UserID"`

	CreatedAt time.Time `json:"created_at"`
}
