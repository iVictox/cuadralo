package models

import "time"

type Follow struct {
	FollowerID  uint      `gorm:"primaryKey" json:"follower_id"`
	FollowingID uint      `gorm:"primaryKey" json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`
}
