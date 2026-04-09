package models

import "time"

type AdminLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	AdminID   uint      `json:"admin_id"`
	Admin     User      `json:"admin" gorm:"foreignKey:AdminID"`
	Action    string    `json:"action"` // e.g., "suspend_user", "verify_payment"
	TargetID  *uint     `json:"target_id"` // ID of the user or payment affected
	Details   string    `json:"details"`
	CreatedAt time.Time `json:"created_at"`
}
