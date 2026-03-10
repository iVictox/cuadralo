package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Username  string    `gorm:"unique" json:"username"`
	Email     string    `gorm:"unique" json:"email"`
	Password  string    `json:"-"`
	BirthDate time.Time `json:"birth_date"`
	Gender    string    `json:"gender"`
	Bio       string    `json:"bio"`
	Location  string    `json:"location"`

	// Fotos
	Photo  string   `json:"photo"`
	Photos []string `gorm:"type:text[]" json:"photos"`

	// ✅ CORRECCIÓN CRÍTICA: Relaciones e Intereses
	Interests     []Interest `gorm:"many2many:user_interests;" json:"-"` // Relación real GORM en la BD
	InterestsList []string   `gorm:"-" json:"interests"`                 // Campo virtual para mandar el JSON al Frontend

	// Stats Sociales
	FollowersCount int `gorm:"default:0" json:"followers_count"`
	FollowingCount int `gorm:"default:0" json:"following_count"`

	// SISTEMA DE ROLES
	Role string `json:"role" gorm:"default:'user'"`

	// SISTEMA PREMIUM "CUADRALO PRIME"
	IsPrime        bool      `json:"is_prime" gorm:"default:false"`
	PrimeExpiresAt time.Time `json:"prime_expires_at"`

	// SISTEMA DE DESTELLOS
	IsBoosted      bool      `json:"is_boosted" gorm:"default:false"`
	BoostExpiresAt time.Time `json:"boost_expires_at"`

	// Estado Frontend (Campos virtuales, no se guardan en BD)
	IsFollowing    bool `gorm:"-" json:"is_following"`
	HasStory       bool `gorm:"-" json:"has_story"`
	HasUnseenStory bool `gorm:"-" json:"has_unseen_story"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
