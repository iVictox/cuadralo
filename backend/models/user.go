package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type StringArray []string

func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "[]", nil
	}
	return json.Marshal(a)
}

func (a *StringArray) Scan(value interface{}) error {
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("falló la conversión de tipo a []byte")
	}
	return json.Unmarshal(bytes, &a)
}

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Username  string    `gorm:"unique" json:"username"`
	Email     string    `gorm:"unique" json:"email"`
	Password  string    `json:"-"`
	BirthDate time.Time `json:"birth_date"`
	Gender    string    `json:"gender"`
	Bio       string    `json:"bio"`
	Location  string    `json:"location"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`

	Photo  string      `json:"photo"`
	Photos StringArray `gorm:"type:text" json:"photos"`

	Preferences string `gorm:"type:text" json:"preferences"`

	Interests     []Interest `gorm:"many2many:user_interests;" json:"-"`
	InterestsList []string   `gorm:"-" json:"interests"`

	FollowersCount int `gorm:"default:0" json:"followers_count"`
	FollowingCount int `gorm:"default:0" json:"following_count"`

	// ✅ FIX CRÍTICO: Campos de suspensión mejorados
	IsSuspended      bool       `json:"is_suspended" gorm:"default:false"`
	SuspendedUntil   *time.Time `json:"suspended_until"`
	SuspensionReason string     `json:"suspension_reason"`

	// Roles: 'user', 'vip', 'admin', 'moderator', 'support', 'superadmin'
	Role             string `json:"role" gorm:"default:'user'"`
	TwoFactorEnabled bool   `json:"two_factor_enabled" gorm:"default:false"`
	TwoFactorSecret  string `json:"-"`

	IsPrime        bool      `json:"is_prime" gorm:"default:false"`
	PrimeExpiresAt time.Time `json:"prime_expires_at"`
	IsBoosted      bool      `json:"is_boosted" gorm:"default:false"`
	BoostExpiresAt time.Time `json:"boost_expires_at"`

	BoostsCount      int       `json:"boosts_count" gorm:"default:0"`
	RompehielosCount int       `json:"rompehielos_count" gorm:"default:0"`
	DailyLikes       int       `json:"daily_likes" gorm:"default:0"`
	LastLikeDate     time.Time `json:"last_like_date"`

	IsFollowing    bool `gorm:"-" json:"is_following"`
	HasStory       bool `gorm:"-" json:"has_story"`
	HasUnseenStory bool `gorm:"-" json:"has_unseen_story"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
