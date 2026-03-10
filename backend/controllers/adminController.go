package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

	"github.com/gofiber/fiber/v2"
)

// ✅ Obtiene las métricas generales para el Dashboard
func GetDashboardStats(c *fiber.Ctx) error {
	var totalUsers int64
	var totalMatches int64
	var totalPosts int64
	var primeUsers int64

	database.DB.Model(&models.User{}).Count(&totalUsers)
	database.DB.Model(&models.Match{}).Count(&totalMatches)
	database.DB.Model(&models.Post{}).Count(&totalPosts)
	database.DB.Model(&models.User{}).Where("is_prime = ?", true).Count(&primeUsers)

	return c.JSON(fiber.Map{
		"total_users":   totalUsers,
		"total_matches": totalMatches,
		"total_posts":   totalPosts,
		"prime_users":   primeUsers,
	})
}

// ✅ Obtiene la lista completa de usuarios para la tabla de administración
func GetAllUsersAdmin(c *fiber.Ctx) error {
	var users []models.User
	// Solo traemos los campos necesarios por seguridad y rendimiento
	if err := database.DB.Select("id, name, username, email, role, is_prime, created_at").Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener usuarios"})
	}
	return c.JSON(users)
}

// ✅ Permite cambiar el rol a un usuario (Ej. de user a admin) o banearlo
func UpdateUserRole(c *fiber.Ctx) error {
	userId := c.Params("id")

	var payload struct {
		Role string `json:"role"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if payload.Role != "user" && payload.Role != "admin" && payload.Role != "banned" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Rol no válido"})
	}

	if err := database.DB.Model(&models.User{}).Where("id = ?", userId).Update("role", payload.Role).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar el rol"})
	}

	return c.JSON(fiber.Map{"message": "Rol actualizado con éxito"})
}
