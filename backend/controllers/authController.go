package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// DTO de Registro
type RegisterDTO struct {
	Name        string   `json:"name"`
	Email       string   `json:"email"`
	Password    string   `json:"password"`
	BirthDate   string   `json:"birthDate"`
	Gender      string   `json:"gender"`
	Photo       string   `json:"photo"`
	Bio         string   `json:"bio"`
	Interests   []string `json:"interests"`
	Preferences struct {
		Distance int    `json:"distance"`
		Show     string `json:"show"`
		AgeRange []int  `json:"ageRange"`
	} `json:"preferences"`
}

func Register(c *fiber.Ctx) error {
	var data RegisterDTO
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// 1. Encriptar Password
	password, _ := bcrypt.GenerateFromPassword([]byte(data.Password), 14)

	// 2. Serializar Preferencias
	prefsJSON, _ := json.Marshal(data.Preferences)

	// 3. Buscar intereses
	var selectedInterests []models.Interest
	if len(data.Interests) > 0 {
		database.DB.Where("slug IN ?", data.Interests).Find(&selectedInterests)
	}

	// 4. GENERAR USERNAME ÚNICO (✅ NUEVO)
	// Ejemplo: Juan Perez -> juanperez1704567890
	cleanName := strings.ToLower(strings.ReplaceAll(data.Name, " ", ""))
	username := fmt.Sprintf("%s%d", cleanName, time.Now().Unix()%10000)

	// 5. Crear Usuario
	user := models.User{
		Name:        data.Name,
		Username:    username, // ✅ Asignamos el username generado
		Email:       data.Email,
		Password:    string(password),
		BirthDate:   data.BirthDate,
		Gender:      data.Gender,
		Age:         calculateAge(data.BirthDate),
		Photo:       data.Photo,
		Bio:         data.Bio,
		Preferences: string(prefsJSON),
		Interests:   selectedInterests,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear el usuario, verifique datos."})
	}

	return c.JSON(fiber.Map{
		"message":  "Usuario registrado exitosamente",
		"username": username, // Devolvemos el username generado
	})
}

// LOGIN (Igual que antes, solo asegúrate de mantenerlo)
func Login(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	email := strings.TrimSpace(data["email"])
	password := strings.TrimSpace(data["password"])

	var user models.User
	database.DB.Where("email = ?", email).First(&user)
	if user.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Contraseña incorrecta"})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	t, err := token.SignedString([]byte("secreto-super-seguro"))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error generando token"})
	}

	cookie := new(fiber.Cookie)
	cookie.Name = "jwt"
	cookie.Value = t
	cookie.Expires = time.Now().Add(time.Hour * 24 * 30)
	cookie.HTTPOnly = true
	c.Cookie(cookie)

	return c.JSON(fiber.Map{
		"message": "Login exitoso",
		"token":   t,
		"user": fiber.Map{
			"id":       user.ID,
			"name":     user.Name,
			"username": user.Username, // ✅ Enviamos username al frontend
			"email":    user.Email,
			"photo":    user.Photo,
		},
	})
}

func calculateAge(birthDate string) int {
	layout := "2006-01-02"
	dob, err := time.Parse(layout, birthDate)
	if err != nil {
		return 18
	}
	now := time.Now()
	age := now.Year() - dob.Year()
	if now.YearDay() < dob.YearDay() {
		age--
	}
	return age
}
