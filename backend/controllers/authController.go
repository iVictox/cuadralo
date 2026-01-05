package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Estructura para recibir los datos exactos del Wizard del Frontend
type RegisterDTO struct {
	Name        string      `json:"name"`
	Email       string      `json:"email"`
	Password    string      `json:"password"`
	BirthDate   string      `json:"birthDate"` // Viene como string "YYYY-MM-DD"
	Gender      string      `json:"gender"`
	Photo       string      `json:"photo"`
	Bio         string      `json:"bio"`
	Interests   []string    `json:"interests"`
	Preferences interface{} `json:"preferences"`
}

func Register(c *fiber.Ctx) error {
	var data RegisterDTO

	// 1. Recibir JSON
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// 2. Encriptar Contraseña
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(data.Password), 14)

	// 3. Convertir Arrays a JSON String
	interestsJSON, _ := json.Marshal(data.Interests)
	preferencesJSON, _ := json.Marshal(data.Preferences)

	// 4. Calcular Edad
	birthDate, err := time.Parse("2006-01-02", data.BirthDate)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Fecha de nacimiento inválida"})
	}

	now := time.Now()
	age := now.Year() - birthDate.Year()
	if now.Before(birthDate.AddDate(age, 0, 0)) {
		age--
	}

	// 5. Crear Usuario
	user := models.User{
		Name:        data.Name,
		Email:       data.Email,
		Password:    string(hashedPassword),
		BirthDate:   data.BirthDate, // <--- CORRECCIÓN: Usamos el string original
		Age:         age,
		Gender:      data.Gender,
		Photo:       data.Photo,
		Bio:         data.Bio,
		Interests:   string(interestsJSON),
		Preferences: string(preferencesJSON),
		CreatedAt:   time.Now(),
	}

	// 6. Guardar en Base de Datos
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "El correo ya está registrado"})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Usuario creado exitosamente",
		"user":    user,
	})
}

// Estructura para Login
type LoginDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c *fiber.Ctx) error {
	var data LoginDTO
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var user models.User
	// Buscar por email
	database.DB.Where("email = ?", data.Email).First(&user)

	if user.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Comparar contraseña
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data.Password)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Contraseña incorrecta"})
	}

	// Crear Token JWT
	claims := jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 72).Unix(), // Dura 3 días
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte("secreto-super-seguro"))

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error generando token"})
	}

	// Guardar token en cookie
	cookie := fiber.Cookie{
		Name:     "jwt",
		Value:    t,
		Expires:  time.Now().Add(time.Hour * 72),
		HTTPOnly: true,
	}
	c.Cookie(&cookie)

	return c.JSON(fiber.Map{
		"message": "Login exitoso",
		"token":   t,
		"user":    user,
	})
}
