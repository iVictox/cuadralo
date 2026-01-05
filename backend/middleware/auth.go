package middleware

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func IsAuthenticated(c *fiber.Ctx) error {
	// 1. Obtener Token de la Cookie o Header
	tokenString := c.Cookies("jwt")

	if tokenString == "" {
		// Intentar leer del Header Authorization: Bearer <token>
		authHeader := c.Get("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "No autenticado"})
	}

	// 2. Validar Firma del Token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado")
		}
		return []byte("secreto-super-seguro"), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token inválido"})
	}

	// 3. Extraer ID del Usuario
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Claims inválidos"})
	}

	userIdFloat, ok := claims["sub"].(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "ID de usuario inválido en token"})
	}
	userId := uint(userIdFloat)

	// --- CORRECCIÓN CRÍTICA: Verificar si el usuario existe en la BD ---
	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		// Si no se encuentra el usuario (fue borrado), invalidamos el acceso
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Usuario no encontrado o eliminado"})
	}
	// ------------------------------------------------------------------

	// 4. Guardar ID en el contexto para usarlo en los controladores
	c.Locals("userId", userIdFloat) // Mantenemos float64 para compatibilidad con tus controladores actuales

	return c.Next()
}
