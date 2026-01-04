package models

import (
	"time"
)

type User struct {
	ID uint `gorm:"primaryKey" json:"id"`

	// Datos de Login
	Name     string `json:"name"`
	Email    string `gorm:"unique" json:"email"`
	Password string `json:"-"` // El guion hace que nunca devolvamos la contraseña al frontend

	// Datos del Wizard (Perfil)
	BirthDate time.Time `json:"birth_date"`
	Age       int       `json:"age"` // Lo calcularemos automáticamente
	Gender    string    `json:"gender"`
	Photo     string    `json:"photo"` // Guardaremos la URL o Base64
	Bio       string    `json:"bio"`

	// Arrays y Objetos (Guardados como JSON string en la BD por simplicidad)
	Interests   string `gorm:"type:text" json:"interests"`
	Preferences string `gorm:"type:text" json:"preferences"`

	// Datos Extra para la App
	IsVerified bool   `gorm:"default:false" json:"is_verified"`
	Role       string `gorm:"default:'user'" json:"role"` // 'user', 'gold', 'admin'

	CreatedAt time.Time `json:"created_at"`
}
