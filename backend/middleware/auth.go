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

func IsAuthenticated(c *fiber.Ctx) error {
	// 1. Obtener Token de la Cookie o Header
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

	// 2. Validar Firma del Token (Soporta env o el secreto en duro)
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "secreto-super-seguro"
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado")
		}
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token inválido"})
	}

	// 3. Extraer ID del Usuario (✅ FIX CRÍTICO: Soluciona la "App Muerta")
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Claims inválidos"})
	}

	var userIdFloat float64
	// Soportamos tokens viejos ("sub") y nuevos ("id") para no cerrar la sesión de nadie
	if id, ok := claims["id"].(float64); ok {
		userIdFloat = id
	} else if sub, ok := claims["sub"].(float64); ok {
		userIdFloat = sub
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "ID de usuario no encontrado en el token"})
	}

	userId := uint(userIdFloat)

	// 4. Verificaciones de Base de Datos
	var user models.User
	if err := database.DB.Select("id, role, is_suspended, suspended_until, suspension_reason").First(&user, userId).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Usuario no encontrado o eliminado"})
	}

	// ✅ A. Bloqueo por Suspensión Activa
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

	// ✅ B. Escudo de Modo Mantenimiento Real
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

	// 5. Guardar ID y Rol en el contexto
	c.Locals("userId", userIdFloat)
	c.Locals("userRole", user.Role)

	return c.Next()
}

// ✅ Middleware para todo el staff (Admin, SuperAdmin, Moderadores)
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

// ✅ Middleware Exclusivo para gestión de seguridad y settings (El dueño)
func IsSuperAdmin(c *fiber.Ctx) error {
	role := c.Locals("userRole")
	if role == nil || role.(string) != "superadmin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Zona de alto riesgo. Acceso restringido exclusivamente a SuperAdministradores."})
	}
	return c.Next()
}
