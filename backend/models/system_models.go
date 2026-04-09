package models

import "time"

// ✅ FIX CRÍTICO: Flujo seguro de asignación de roles
type AdminRequest struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `json:"user_id"`
	User          User      `gorm:"foreignKey:UserID" json:"user"`
	RequestedRole string    `json:"requested_role"` // admin, moderator, support
	Reason        string    `json:"reason"`
	Status        string    `json:"status" gorm:"default:'pending'"` // pending, approved, denied
	ApprovedByID  *uint     `json:"approved_by_id"`
	DeniedReason  string    `json:"denied_reason"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ✅ FIX CRÍTICO: Registro de actividad de usuarios
type UserActivityLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	Action    string    `json:"action"`
	Metadata  string    `json:"metadata"`
	IPAddress string    `json:"ip_address"`
	CreatedAt time.Time `json:"created_at"`
}
