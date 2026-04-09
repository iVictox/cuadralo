package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	password, _ := bcrypt.GenerateFromPassword([]byte(data["password"]), 14)
	birthDate, _ := time.Parse("2006-01-02", data["birth_date"])

	user := models.User{
		Name:      data["name"],
		Email:     data["email"],
		Username:  data["username"],
		Password:  string(password),
		Gender:    data["gender"],
		BirthDate: birthDate,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "El usuario o email ya existe"})
	}

	return c.JSON(fiber.Map{"message": "Registro exitoso", "user": user})
}

func Login(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var user models.User
	database.DB.Where("email = ?", data["email"]).First(&user)

	if user.ID == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Credenciales incorrectas"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data["password"])); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Credenciales incorrectas"})
	}

	// ✅ FIX CRÍTICO: Bloquear acceso en el Login si está suspendido
	if user.IsSuspended {
		if user.SuspendedUntil != nil && user.SuspendedUntil.Before(time.Now()) {
			// Levantar suspensión silenciosamente
			database.DB.Model(&user).Updates(map[string]interface{}{
				"is_suspended":      false,
				"suspended_until":   nil,
				"suspension_reason": "",
			})
		} else {
			msg := "Tu cuenta ha sido suspendida y no puedes iniciar sesión."
			if user.SuspensionReason != "" {
				msg += " Motivo: " + user.SuspensionReason
			}
			if user.SuspendedUntil != nil {
				msg += fmt.Sprintf(". Expiración: %s", user.SuspendedUntil.Format("02/01/2006 15:04"))
			}
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": msg, "is_suspended": true})
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 días
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo generar el token"})
	}

	return c.JSON(fiber.Map{
		"message": "Login exitoso",
		"token":   tokenString,
		"user": fiber.Map{
			"id":       user.ID,
			"name":     user.Name,
			"username": user.Username,
			"email":    user.Email,
			"photo":    user.Photo,
			"role":     user.Role,
			"is_prime": user.IsPrime,
		},
	})
}
