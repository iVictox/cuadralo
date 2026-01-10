package models

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	Username  string `gorm:"uniqueIndex" json:"username"`
	Email     string `gorm:"unique" json:"email"`
	Password  string `json:"-"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	BirthDate string `json:"birth_date"`

	Photo  string   `json:"photo"`
	Photos []string `gorm:"serializer:json" json:"photos"`
	Bio    string   `gorm:"size:1000" json:"bio"`

	Interests     []Interest `gorm:"many2many:user_interests;" json:"interests_obj"`
	InterestsList []string   `gorm:"-" json:"interests"`

	Preferences string `json:"preferences"`

	Likes         []Like         `gorm:"foreignKey:FromUserID"`
	Matches       []Match        `gorm:"foreignKey:User1ID"`
	Subscriptions []Subscription `gorm:"foreignKey:UserID"`
	Boosts        []Boost        `gorm:"foreignKey:UserID"`

	CreatedAt time.Time `json:"created_at"`

	Followers   int64 `gorm:"-" json:"followers_count"`
	Following   int64 `gorm:"-" json:"following_count"`
	IsFollowing bool  `gorm:"-" json:"is_following"`

	// ✅ NUEVOS CAMPOS PARA HISTORIAS
	HasStory       bool `gorm:"-" json:"has_story"`
	HasUnseenStory bool `gorm:"-" json:"has_unseen_story"`
}

type Follow struct {
	FollowerID  uint      `gorm:"primaryKey" json:"follower_id"`
	FollowingID uint      `gorm:"primaryKey" json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`
}
