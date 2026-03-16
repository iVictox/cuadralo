package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetMyPlan: Obtener estado actual de mi suscripción, inventarios y destellos activos
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

	// 2. Verificar si expiró el Destello actual
	if user.IsBoosted && time.Now().After(user.BoostExpiresAt) {
		user.IsBoosted = false
		database.DB.Save(&user)
	}

	return c.JSON(fiber.Map{
		"is_prime":          user.IsPrime,
		"prime_expires_at":  user.PrimeExpiresAt,
		"is_boosted":        user.IsBoosted,
		"boost_expires_at":  user.BoostExpiresAt,
		"boosts_count":      user.BoostsCount,
		"rompehielos_count": user.RompehielosCount,
	})
}

// BuyPrime: Comprar Suscripción "Cuadralo Prime" ($4.99/mes)
func BuyPrime(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	user.IsPrime = true
	if user.PrimeExpiresAt.After(time.Now()) {
		user.PrimeExpiresAt = user.PrimeExpiresAt.Add(30 * 24 * time.Hour)
	} else {
		user.PrimeExpiresAt = time.Now().Add(30 * 24 * time.Hour)
	}

	// ✅ FASE 2: Bono Mensual Prime (1 Destello y 3 Rompehielos)
	user.BoostsCount += 1
	user.RompehielosCount += 3

	database.DB.Save(&user)

	return c.JSON(fiber.Map{
		"message": "¡Bienvenido a Cuadralo Prime! Disfruta de tus bonos mensuales.",
		"user":    user,
	})
}

// BuyBoost: Comprar Paquetes de Destellos (Suma al inventario)
func BuyBoost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))

	var data struct {
		Amount int `json:"amount"` // 1, 5, o 10
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if data.Amount != 1 && data.Amount != 5 && data.Amount != 10 {
		return c.Status(400).JSON(fiber.Map{"error": "Paquete inválido"})
	}

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// ✅ Agregamos los destellos al inventario (No se activan todavía)
	user.BoostsCount += data.Amount
	database.DB.Save(&user)

	return c.JSON(fiber.Map{
		"message":      "¡Destellos comprados con éxito!",
		"boosts_count": user.BoostsCount,
	})
}

// BuyRompehielos: Comprar Paquetes de Rompehielos (Suma al inventario)
func BuyRompehielos(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))

	var data struct {
		Amount int `json:"amount"` // 1, 5, o 15
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if data.Amount != 1 && data.Amount != 5 && data.Amount != 15 {
		return c.Status(400).JSON(fiber.Map{"error": "Paquete inválido"})
	}

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Agregamos al inventario
	user.RompehielosCount += data.Amount
	database.DB.Save(&user)

	return c.JSON(fiber.Map{
		"message":           "¡Rompehielos comprados con éxito!",
		"rompehielos_count": user.RompehielosCount,
	})
}

// ✅ FASE 2: Activar Destello (Gastar del inventario)
func ActivateBoost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if user.BoostsCount <= 0 {
		return c.Status(403).JSON(fiber.Map{"error": "No tienes destellos disponibles. Compra más en la tienda."})
	}

	if user.IsBoosted && user.BoostExpiresAt.After(time.Now()) {
		return c.Status(400).JSON(fiber.Map{"error": "Ya tienes un destello activo."})
	}

	// Restamos del inventario y activamos por 30 minutos
	user.BoostsCount -= 1
	user.IsBoosted = true
	user.BoostExpiresAt = time.Now().Add(30 * time.Minute)
	database.DB.Save(&user)

	return c.JSON(fiber.Map{
		"message":      "¡Destello activado! Serás el perfil principal en tu zona por 30 minutos.",
		"expires_at":   user.BoostExpiresAt,
		"boosts_count": user.BoostsCount,
	})
}
