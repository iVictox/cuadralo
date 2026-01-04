package models

import (
	"time"

	"gorm.io/gorm"
)

// User representa el perfil del usuario en la app
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:100;not null" json:"name"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"` // El guión evita que se envíe la contraseña en el JSON
	Age       int            `json:"age"`
	Gender    string         `json:"gender"` // "M", "F", "O"
	Bio       string         `json:"bio"`
	Photos    string         `json:"photos"` // Guardaremos URLs separadas por coma por ahora
	Latitude  float64        `json:"latitude"`
	Longitude float64        `json:"longitude"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
