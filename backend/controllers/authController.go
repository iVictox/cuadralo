package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type RegisterDTO struct {
	Name        string   `json:"name"`
	Username    string   `json:"username"` // ✅ AÑADIDO: Nombre de usuario personalizado
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

	password, _ := bcrypt.GenerateFromPassword([]byte(data.Password), 14)

	birthTime, err := time.Parse("2006-01-02", data.BirthDate)
	if err != nil {
		birthTime = time.Now().AddDate(-18, 0, 0)
	}

	// ✅ LÓGICA DE USUARIO: Usa el enviado o genera uno automático
	username := strings.ToLower(strings.ReplaceAll(data.Username, " ", ""))
	if username == "" {
		cleanName := strings.ToLower(strings.ReplaceAll(data.Name, " ", ""))
		username = fmt.Sprintf("%s%d", cleanName, time.Now().Unix()%1000)
	}

	// 1. CREAR EL USUARIO
	user := models.User{
		Name:      data.Name,
		Username:  username,
		Email:     data.Email,
		Password:  string(password),
		BirthDate: birthTime,
		Gender:    data.Gender,
		Photo:     data.Photo,
		Bio:       data.Bio,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		// ✅ EVITAR DUPLICADOS DE USUARIO
		if strings.Contains(err.Error(), "username") {
			return c.Status(400).JSON(fiber.Map{"error": "Ese nombre de usuario ya está en uso."})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Error al crear cuenta. El email o usuario ya existe."})
	}

	// 2. CREAR Y ASOCIAR INTERESES CON SEGURIDAD TOTAL
	if len(data.Interests) > 0 {
		var finalInterests []models.Interest

		for _, slug := range data.Interests {
			var interest models.Interest

			// Usamos FirstOrCreate. Si no existe un interés con ese Slug, lo inserta.
			// Así evitamos el error "record not found" en el log.
			database.DB.Where(models.Interest{Slug: slug}).FirstOrCreate(&interest, models.Interest{
				Name:     slug,
				Slug:     slug,
				Category: "General",
			})

			finalInterests = append(finalInterests, interest)
		}

		// Asociamos la lista de intereses a nuestro usuario en la base de datos
		database.DB.Model(&user).Association("Interests").Append(finalInterests)
	}

	return c.JSON(fiber.Map{
		"message":  "Usuario registrado",
		"username": username,
	})
}

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
		"sub": float64(user.ID),
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
			"username": user.Username,
			"email":    user.Email,
			"photo":    user.Photo,
			"role":     user.Role,
		},
	})
}
