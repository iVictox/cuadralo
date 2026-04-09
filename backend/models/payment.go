package models

import "time"

// Historial de compras procesadas
type Transaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	Type      string    `json:"type"`
	ItemName  string    `json:"item_name"`
	Amount    float64   `json:"amount"`
	Duration  int       `json:"duration"`
	CreatedAt time.Time `json:"created_at"`
}

// Reporte de pagos manuales (Pago Móvil, Transferencias, etc.)
type PaymentReport struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	ItemType  string    `json:"item_type"`
	AmountUSD float64   `json:"amount_usd"`
	AmountVES float64   `json:"amount_ves"`
	Rate      float64   `json:"rate"`
	Reference string    `json:"reference"`
	Bank      string    `json:"bank"`
	Phone     string    `json:"phone"`
	Receipt   string    `json:"receipt"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"` // ✅ Se usa como Fecha de Compra
	UpdatedAt time.Time `json:"updated_at"` // ✅ NUEVO: Se usa como Fecha de Aprobación por el Admin
}
