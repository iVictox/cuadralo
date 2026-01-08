package models

import "time"

// --- PUBLICACIONES ---
type Post struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	ImageURL  string    `json:"image_url"`
	Caption   string    `json:"caption"`
	Location  string    `json:"location"`
	CreatedAt time.Time `json:"created_at"`

	Likes    []PostLike `gorm:"foreignKey:PostID" json:"likes"`
	Comments []Comment  `gorm:"foreignKey:PostID" json:"comments"`

	IsLiked    bool  `gorm:"-" json:"is_liked"`
	LikesCount int64 `gorm:"-" json:"likes_count"`
}

type PostLike struct {
	UserID uint `gorm:"primaryKey" json:"user_id"`
	PostID uint `gorm:"primaryKey" json:"post_id"`
}

// --- COMENTARIOS ---
type Comment struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	PostID  uint   `json:"post_id"`
	UserID  uint   `json:"user_id"`
	User    User   `gorm:"foreignKey:UserID" json:"user"`
	Content string `json:"content"`

	ParentID *uint     `json:"parent_id"`
	Replies  []Comment `gorm:"foreignKey:ParentID" json:"replies"`

	Likes      []CommentLike `gorm:"foreignKey:CommentID" json:"likes"`
	IsLiked    bool          `gorm:"-" json:"is_liked"`
	LikesCount int64         `gorm:"-" json:"likes_count"`

	CreatedAt time.Time `json:"created_at"`
}

type CommentLike struct {
	UserID    uint `gorm:"primaryKey" json:"user_id"`
	CommentID uint `gorm:"primaryKey" json:"comment_id"`
}

// --- HISTORIAS ---
type Story struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	ImageURL  string    `json:"image_url"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

// --- REPORTES (NUEVO) ---
type Report struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ReporterID uint      `json:"reporter_id"` // Quién reporta
	PostID     uint      `json:"post_id"`     // Qué reporta
	Reason     string    `json:"reason"`      // Motivo
	CreatedAt  time.Time `json:"created_at"`
}
