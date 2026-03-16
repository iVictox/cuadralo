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

// ✅ NUEVO: Reporte de pagos manuales (Pago Móvil, Transferencias, etc.)
type PaymentReport struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	ItemType  string    `json:"item_type"`  // "vip", "boost", "rompehielo"
	AmountUSD float64   `json:"amount_usd"` // Precio original en dólares
	AmountVES float64   `json:"amount_ves"` // Lo que pagó en Bolívares
	Rate      float64   `json:"rate"`       // Tasa Euro BCV usada
	Reference string    `json:"reference"`  // Referencia del pago móvil
	Bank      string    `json:"bank"`       // Banco emisor
	Phone     string    `json:"phone"`      // Teléfono emisor
	Receipt   string    `json:"receipt"`    // URL del capture de pantalla
	Status    string    `json:"status"`     // "pending", "approved", "rejected"
	CreatedAt time.Time `json:"created_at"`
}