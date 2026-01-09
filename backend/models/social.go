package models

import "time"

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

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PostID    uint      `json:"post_id"`
	UserID    uint      `json:"user_id"`
	User      User      `json:"user"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`

	ParentID *uint         `json:"parent_id"`
	Replies  []Comment     `gorm:"foreignkey:ParentID" json:"replies"`
	Likes    []CommentLike `gorm:"foreignKey:CommentID" json:"likes"`

	LikesCount int64 `gorm:"-" json:"likes_count"`
	IsLiked    bool  `gorm:"-" json:"is_liked"`
}

type PostLike struct {
	UserID uint `gorm:"primaryKey" json:"user_id"`
	PostID uint `gorm:"primaryKey" json:"post_id"`
}

type CommentLike struct {
	UserID    uint `gorm:"primaryKey" json:"user_id"`
	CommentID uint `gorm:"primaryKey" json:"comment_id"`
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

// ✅ NUEVO: Modelo de Notificación
type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`   // Destinatario
	SenderID  uint      `json:"sender_id"` // Quien realiza la acción
	Sender    User      `json:"sender" gorm:"foreignKey:SenderID"`
	Type      string    `json:"type"`    // like, comment, follow, match
	PostID    *uint     `json:"post_id"` // Opcional (si es en un post)
	Post      Post      `json:"post"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}
