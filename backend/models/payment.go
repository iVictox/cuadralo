package models

import "time"

// Registro de transacciones (Historial de compras)
type Transaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	Type      string    `json:"type"`      // "prime_subscription" o "boost"
	ItemName  string    `json:"item_name"` // Ej: "Cuadralo Prime", "Destello Flash 30m"
	Amount    float64   `json:"amount"`    // Precio pagado
	Duration  int       `json:"duration"`  // Duración en minutos (referencia)
	CreatedAt time.Time `json:"created_at"`
}
