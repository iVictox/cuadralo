package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

	"github.com/gofiber/fiber/v2"
)

// Register crea un nuevo usuario
func Register(c *fiber.Ctx) error {
	var data map[string]interface{}

	// Parsear el body del request
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Error al procesar datos"})
	}

	// Validar contraseña (muy básico por ahora)
	if data["password"] == nil {
		return c.Status(400).JSON(fiber.Map{"error": "La contraseña es requerida"})
	}

	// Crear modelo usuario
	user := models.User{
		Name:      data["name"].(string),
		Email:     data["email"].(string),
		Password:  data["password"].(string),  // OJO: Aquí en el futuro encriptaremos
		Age:       int(data["age"].(float64)), // JSON numbers son floats por defecto
		Gender:    data["gender"].(string),
		Latitude:  0.0,
		Longitude: 0.0,
	}

	// Guardar en DB
	result := database.DB.Create(&user)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear el usuario, email duplicado?"})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Usuario creado exitosamente",
		"user":    user,
	})
}

// HelloTest para probar que el server vive
func HelloTest(c *fiber.Ctx) error {
	return c.SendString("¡Hola Victor! El servidor de Cuadralo está volando 🚀")
}
