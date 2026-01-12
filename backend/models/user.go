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

	// Relaciones e Intereses
	Interests []string `gorm:"type:text[]" json:"interests"`

	// Stats Sociales
	FollowersCount int `gorm:"default:0" json:"followers_count"`
	FollowingCount int `gorm:"default:0" json:"following_count"`

	// ✅ NUEVO SISTEMA PREMIUM "CUADRALO PRIME"
	IsPrime        bool      `json:"is_prime" gorm:"default:false"`
	PrimeExpiresAt time.Time `json:"prime_expires_at"` // Cuándo vence la suscripción

	// ✅ NUEVO SISTEMA DE DESTELLOS
	IsBoosted      bool      `json:"is_boosted" gorm:"default:false"` // ¿Tiene destello activo?
	BoostExpiresAt time.Time `json:"boost_expires_at"`                // Cuándo se apaga el destello

	// Estado Frontend (Campos virtuales, no se guardan en BD)
	IsFollowing    bool `gorm:"-" json:"is_following"`
	HasStory       bool `gorm:"-" json:"has_story"`
	HasUnseenStory bool `gorm:"-" json:"has_unseen_story"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
