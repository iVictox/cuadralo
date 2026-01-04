package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// IsAuthenticated revisa si el usuario envió un token válido
func IsAuthenticated(c *fiber.Ctx) error {
	// 1. Buscar el token en las Cookies o en los Headers
	tokenString := c.Cookies("jwt")

	// Si no está en cookies, buscar en Header "Authorization: Bearer ..."
	if tokenString == "" {
		headers := c.Get("Authorization")
		if len(headers) > 7 && headers[:7] == "Bearer " {
			tokenString = headers[7:]
		}
	}

	if tokenString == "" {
		return c.Status(401).JSON(fiber.Map{"error": "No estás autorizado. Inicia sesión."})
	}

	// 2. Validar el token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte("secreto-super-seguro"), nil // Debe coincidir con la clave del authController
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"error": "Token inválido o expirado"})
	}

	// 3. Obtener el ID del usuario del token
	claims := token.Claims.(jwt.MapClaims)
	userId := claims["sub"] // "sub" es donde guardamos el ID en el login

	// 4. Guardar el ID en el contexto para usarlo en los controladores
	c.Locals("userId", userId)

	return c.Next() // Dejar pasar
}
