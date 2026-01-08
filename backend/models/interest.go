package models

type Interest struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Slug string `gorm:"uniqueIndex" json:"slug"` // ej: "music", "gym"
	Name string `json:"name"`                    // ej: "Música", "Fitness"
}
