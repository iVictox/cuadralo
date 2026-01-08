package models

import (
	"gorm.io/gorm"
)

type Message struct {
	gorm.Model
	SenderID   uint   `json:"sender_id"`
	ReceiverID uint   `json:"receiver_id"`
	Content    string `json:"content"`
	Type       string `json:"type"` // "text", "image"
	IsRead     bool   `json:"is_read" gorm:"default:false"`

	IsSaved    bool `json:"is_saved" gorm:"default:false"`     // Si es true, no se borra a las 24h
	IsViewOnce bool `json:"is_view_once" gorm:"default:false"` // Si es true, solo se ve una vez
	IsViewed   bool `json:"is_viewed" gorm:"default:false"`    // Si ya fue vista (para fotos efímeras)
}
