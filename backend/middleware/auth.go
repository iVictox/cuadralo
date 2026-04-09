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

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")

		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "No autorizado, token faltante"})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("método de firma inesperado")
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token inválido o expirado"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Reclamos del token inválidos"})
		}

		userIDFloat, ok := claims["id"].(float64)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "ID de usuario inválido en el token"})
		}

		userID := uint(userIDFloat)

		// ✅ FIX CRÍTICO: Verificación estricta de suspensión a nivel de base de datos
		var user models.User
		if err := database.DB.Select("id, is_suspended, suspended_until, suspension_reason").First(&user, userID).Error; err == nil {
			if user.IsSuspended {
				// Revisar si la suspensión ya expiró
				if user.SuspendedUntil != nil && user.SuspendedUntil.Before(time.Now()) {
					database.DB.Model(&user).Updates(map[string]interface{}{
						"is_suspended":      false,
						"suspended_until":   nil,
						"suspension_reason": "",
					})
				} else {
					// Rechazar el acceso. La cuenta sigue suspendida.
					msg := "Tu cuenta ha sido suspendida."
					if user.SuspensionReason != "" {
						msg += " Razón: " + user.SuspensionReason
					}
					if user.SuspendedUntil != nil {
						msg += fmt.Sprintf(". Expira el: %s", user.SuspendedUntil.Format("02/01/2006 15:04"))
					}
					return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
						"error":        msg,
						"is_suspended": true,
					})
				}
			}
		}

		c.Locals("userId", userIDFloat)
		return c.Next()
	}
}

// Middleware genérico para panel admin (Cualquier nivel de admin)
func AdminRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := uint(c.Locals("userId").(float64))
		var user models.User
		if err := database.DB.Select("role").First(&user, userID).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Usuario no encontrado"})
		}

		validRoles := map[string]bool{"superadmin": true, "admin": true, "moderator": true, "support": true}
		if !validRoles[user.Role] {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acceso denegado. Se requieren privilegios de administrador."})
		}

		c.Locals("userRole", user.Role)
		return c.Next()
	}
}

// Middleware estricto solo para gestión de administradores (SuperAdmin)
func SuperAdminRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := uint(c.Locals("userId").(float64))
		var user models.User
		if err := database.DB.Select("role").First(&user, userID).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Usuario no encontrado"})
		}

		if user.Role != "superadmin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Zona de alto riesgo. Acceso restringido exclusivamente a SuperAdministradores."})
		}
		return c.Next()
	}
}
