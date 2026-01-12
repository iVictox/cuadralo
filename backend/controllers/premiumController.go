package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// --- CONFIGURACIÓN DE PRECIOS ---
const (
	PrimePrice = 4.99

	Boost30MinPrice  = 0.99
	Boost1HourPrice  = 1.49
	Boost3HoursPrice = 3.99
)

// GetMyPlan: Obtener estado actual de mi suscripción y destellos
func GetMyPlan(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// 1. Verificar si expiró Prime
	if user.IsPrime && time.Now().After(user.PrimeExpiresAt) {
		user.IsPrime = false
		database.DB.Save(&user)
	}

	// 2. Verificar si expiró Boost
	if user.IsBoosted && time.Now().After(user.BoostExpiresAt) {
		user.IsBoosted = false
		database.DB.Save(&user)
	}

	return c.JSON(fiber.Map{
		"is_prime":         user.IsPrime,
		"prime_expires_at": user.PrimeExpiresAt,
		"is_boosted":       user.IsBoosted,
		"boost_expires_at": user.BoostExpiresAt,
	})
}

// BuyPrime: Comprar Suscripción "Cuadralo Prime"
func BuyPrime(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// NOTA: Aquí iría la integración real con Stripe/PayPal.
	// Por ahora simulamos que el pago fue exitoso directamente.

	// 1. Actualizar usuario
	user.IsPrime = true
	// Si ya tenía prime activo y no ha vencido, le sumamos 30 días a la fecha de expiración actual.
	// Si no tenía o ya venció, empieza a contar 30 días desde hoy.
	if user.PrimeExpiresAt.After(time.Now()) {
		user.PrimeExpiresAt = user.PrimeExpiresAt.Add(30 * 24 * time.Hour)
	} else {
		user.PrimeExpiresAt = time.Now().Add(30 * 24 * time.Hour)
	}
	database.DB.Save(&user)

	// 2. Guardar historial de transacción
	transaction := models.Transaction{
		UserID:    userId,
		Type:      "prime_subscription",
		ItemName:  "Cuadralo Prime (1 Mes)",
		Amount:    PrimePrice,
		Duration:  43200, // 30 días en minutos (aprox)
		CreatedAt: time.Now(),
	}
	database.DB.Create(&transaction)

	return c.JSON(fiber.Map{
		"message": "¡Bienvenido a Cuadralo Prime!",
		"user":    user,
	})
}

// BuyBoost: Comprar Destello (Visibilidad)
func BuyBoost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))

	// Estructura para recibir qué tipo de destello quiere
	var data struct {
		Type string `json:"type"` // Valores esperados: "30min", "1hour", "3hours"
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var duration time.Duration
	var price float64
	var name string
	var minutes int

	// Configurar duración y precio según el tipo
	switch data.Type {
	case "30min":
		duration = 30 * time.Minute
		price = Boost30MinPrice
		name = "Destello Flash (30m)"
		minutes = 30
	case "1hour":
		duration = 1 * time.Hour
		price = Boost1HourPrice
		name = "Destello Super (1h)"
		minutes = 60
	case "3hours":
		duration = 3 * time.Hour
		price = Boost3HoursPrice
		name = "Destello Mega (3h)"
		minutes = 180
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Tipo de destello inválido"})
	}

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// 1. Actualizar usuario (Activar Boost)
	user.IsBoosted = true

	// Si ya tiene un boost activo, extendemos el tiempo desde su fecha de expiración actual.
	// Si no, empieza desde ahora.
	if user.BoostExpiresAt.After(time.Now()) {
		user.BoostExpiresAt = user.BoostExpiresAt.Add(duration)
	} else {
		user.BoostExpiresAt = time.Now().Add(duration)
	}

	database.DB.Save(&user)

	// 2. Guardar historial de transacción
	transaction := models.Transaction{
		UserID:    userId,
		Type:      "boost",
		ItemName:  name,
		Amount:    price,
		Duration:  minutes,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&transaction)

	return c.JSON(fiber.Map{
		"message":    "¡Destello activado! Tu perfil será más visible.",
		"expires_at": user.BoostExpiresAt,
	})
}
