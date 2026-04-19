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

	LikesCount    int64 `gorm:"-" json:"likes_count"`
	CommentsCount int64 `gorm:"-" json:"comments_count"`
	IsLiked       bool  `gorm:"-" json:"is_liked"`
}

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PostID    uint      `json:"post_id"`
	Post      Post      `json:"post" gorm:"foreignKey:PostID"`
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

	Seen       bool  `gorm:"-" json:"seen"`
	ViewsCount int64 `gorm:"-" json:"views_count"`
}

type StoryView struct {
	StoryID   uint      `gorm:"primaryKey" json:"story_id"`
	UserID    uint      `gorm:"primaryKey" json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	CreatedAt time.Time `json:"created_at"`
}

// ✅ FIX: El modelo de Reporte ahora soporta denuncias tanto a Posts como a Comentarios y Usuarios
type Report struct {
	ID       uint `gorm:"primaryKey" json:"id"`
	UserID   uint `json:"user_id"` // Usuario que reporta
	Reporter User `json:"reporter" gorm:"foreignKey:UserID"`

	PostID *uint `json:"post_id"`
	Post   Post  `json:"post" gorm:"foreignKey:PostID"`

	CommentID *uint   `json:"comment_id"` // ✅ NUEVO: Soporte para comentarios
	Comment   Comment `json:"comment" gorm:"foreignKey:CommentID"`

	ReportedUserID *uint `json:"reported_user_id"` // ✅ NUEVO: Usuario reportado
	ReportedUser  User  `json:"reported_user" gorm:"foreignKey:ReportedUserID"`

	Reason    string    `json:"reason"`
	Status    string    `json:"status" gorm:"default:'pending'"` // "pending", "resolved", "dismissed"
	CreatedAt time.Time `json:"created_at"`
}

type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	SenderID  uint      `json:"sender_id"`
	Sender    User      `json:"sender" gorm:"foreignKey:SenderID"`
	Type      string    `json:"type"`
	PostID    *uint     `json:"post_id"`
	Post      Post      `json:"post"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}
