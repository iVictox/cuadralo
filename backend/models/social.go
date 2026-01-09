package models

import "time"

// Modelo de Publicación (Post)
type Post struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	User      User      `json:"user"`
	ImageURL  string    `json:"image_url"`
	Caption   string    `json:"caption"`
	Location  string    `json:"location"`
	CreatedAt time.Time `json:"created_at"`

	Likes    []PostLike `gorm:"foreignKey:PostID" json:"likes"`
	Comments []Comment  `gorm:"foreignKey:PostID" json:"comments"`

	LikesCount int64 `gorm:"-" json:"likes_count"`
	IsLiked    bool  `gorm:"-" json:"is_liked"`
}

// ✅ Modelo de Comentario Actualizado (Soporte Hilos)
type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PostID    uint      `json:"post_id"`
	UserID    uint      `json:"user_id"`
	User      User      `json:"user"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`

	// ✅ Nuevo: Sistema de Respuestas
	ParentID *uint     `json:"parent_id"` // Puntero para aceptar NULL (comentarios raíz)
	Replies  []Comment `gorm:"foreignkey:ParentID" json:"replies"`

	// Relación
	Likes []CommentLike `gorm:"foreignKey:CommentID" json:"likes"`

	// Campos Virtuales
	LikesCount int64 `gorm:"-" json:"likes_count"`
	IsLiked    bool  `gorm:"-" json:"is_liked"`
}

type PostLike struct {
	UserID uint `gorm:"primaryKey" json:"user_id"`
	PostID uint `gorm:"primaryKey" json:"post_id"`
}

type Story struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	User      User      `json:"user"`
	ImageURL  string    `json:"image_url"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

type Report struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	PostID    uint      `json:"post_id"`
	Reason    string    `json:"reason"`
	CreatedAt time.Time `json:"created_at"`
}

type CommentLike struct {
	UserID    uint `gorm:"primaryKey" json:"user_id"`
	CommentID uint `gorm:"primaryKey" json:"comment_id"`
}
