package middleware

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// ✅ FIX CRÍTICO: Función unificada para garantizar la misma firma en toda la app
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "secreto-super-seguro"
	}
	return secret
}

func IsAuthenticated(c *fiber.Ctx) error {
	tokenString := c.Cookies("jwt")

	if tokenString == "" {
		authHeader := c.Get("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "No autenticado"})
	}

	// Parsing seguro con la misma firma del controlador
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado")
		}
		return []byte(getJWTSecret()), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token inválido o expirado"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Claims inválidos"})
	}

	var userIdFloat float64
	if id, ok := claims["id"].(float64); ok {
		userIdFloat = id
	} else if sub, ok := claims["sub"].(float64); ok {
		userIdFloat = sub
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "ID de usuario no encontrado en el token"})
	}

	userId := uint(userIdFloat)

	var user models.User
	if err := database.DB.Select("id, role, is_suspended, suspended_until, suspension_reason").First(&user, userId).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Usuario no encontrado o eliminado"})
	}

	if user.IsSuspended {
		if user.SuspendedUntil != nil && user.SuspendedUntil.Before(time.Now()) {
			database.DB.Model(&user).Updates(map[string]interface{}{
				"is_suspended":      false,
				"suspended_until":   nil,
				"suspension_reason": "",
			})
		} else {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":        "Tu cuenta ha sido suspendida. " + user.SuspensionReason,
				"is_suspended": true,
			})
		}
	}

	var maintenance models.Setting
	database.DB.Where("key = ?", "maintenance_mode").First(&maintenance)

	if maintenance.Value == "true" {
		validRoles := map[string]bool{"superadmin": true, "admin": true, "moderator": true, "support": true}
		if !validRoles[user.Role] {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"error":       "La plataforma se encuentra en mantenimiento programado. Intenta de nuevo más tarde.",
				"maintenance": true,
			})
		}
	}

	c.Locals("userId", userIdFloat)
	c.Locals("userRole", user.Role)

	return c.Next()
}

func IsAdmin(c *fiber.Ctx) error {
	role := c.Locals("userRole")
	if role == nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acceso denegado."})
	}

	roleStr := role.(string)
	validRoles := map[string]bool{"superadmin": true, "admin": true, "moderator": true, "support": true}

	if !validRoles[roleStr] {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acceso denegado. Privilegios de administrador requeridos."})
	}

	return c.Next()
}

func IsSuperAdmin(c *fiber.Ctx) error {
	role := c.Locals("userRole")
	if role == nil || role.(string) != "superadmin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Zona de alto riesgo. Acceso restringido exclusivamente a SuperAdministradores."})
	}
	return c.Next()
}