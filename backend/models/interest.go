package models

type Interest struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"uniqueIndex" json:"name"` // Ej: "Fútbol"
	Slug     string `gorm:"uniqueIndex" json:"slug"` // Ej: "futbol"
	Category string `json:"category"`                // Ej: "Deportes"
}
