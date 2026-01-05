package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// 1. OBTENER MI PERFIL (Incluye plan activo)
func GetMe(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var user models.User

	// Preload carga las relaciones. Filtramos solo la suscripción activa.
	if err := database.DB.Preload("Subscriptions", "status = ? AND end_date > ?", "active", time.Now()).
		First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Preload Boost activo
	database.DB.Preload("Boosts", "expires_at > ?", time.Now()).First(&user, userId)

	// Construimos una respuesta personalizada para el frontend
	role := "free"
	if len(user.Subscriptions) > 0 {
		role = user.Subscriptions[0].Plan
	}

	// Contar matches
	var matchCount int64
	database.DB.Model(&models.Match{}).Where("user1_id = ? OR user2_id = ?", user.ID, user.ID).Count(&matchCount)

	return c.JSON(fiber.Map{
		"id":          user.ID,
		"name":        user.Name,
		"email":       user.Email,
		"age":         user.Age,
		"photo":       user.Photo,
		"bio":         user.Bio,
		"interests":   user.Interests,
		"preferences": user.Preferences,
		"role":        role, // Enviamos el rol calculado
		"match_count": matchCount,
		"has_boost":   len(user.Boosts) > 0, // Boolean si tiene boost activo
	})
}

// 2. ACTUALIZAR PERFIL
func UpdateMe(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	type UpdateInput struct {
		Name        string      `json:"name"`
		Bio         string      `json:"bio"`
		Photo       string      `json:"photo"`
		Interests   []string    `json:"interests"`
		Preferences interface{} `json:"preferences"`
	}
	var input UpdateInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if input.Name != "" {
		user.Name = input.Name
	}
	if input.Bio != "" {
		user.Bio = input.Bio
	}
	if input.Photo != "" {
		user.Photo = input.Photo
	}

	if input.Interests != nil {
		interestsJSON, _ := json.Marshal(input.Interests)
		user.Interests = string(interestsJSON)
	}
	if input.Preferences != nil {
		prefsJSON, _ := json.Marshal(input.Preferences)
		user.Preferences = string(prefsJSON)
	}

	database.DB.Save(&user)
	return c.JSON(user)
}

// 3. OBTENER FEED (ALGORITMO MEJORADO CON RELACIONES)
func GetFeed(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	// Obtener mis preferencias
	var me models.User
	database.DB.First(&me, myId)

	type Prefs struct {
		Distance int    `json:"distance"`
		Show     string `json:"show"`
		AgeRange []int  `json:"ageRange"`
	}
	var myPrefs Prefs
	myPrefs.Show = "Todos"
	myPrefs.AgeRange = []int{18, 99}
	if me.Preferences != "" {
		json.Unmarshal([]byte(me.Preferences), &myPrefs)
	}

	// Excluir Swipes
	var swipedIds []uint
	database.DB.Model(&models.Like{}).Where("from_user_id = ?", myId).Pluck("to_user_id", &swipedIds)
	swipedIds = append(swipedIds, myId)

	// --- QUERY COMPLEJA ---
	query := database.DB.Table("users").
		Select("users.*").
		Joins("LEFT JOIN boosts ON boosts.user_id = users.id AND boosts.expires_at > ?", time.Now()).
		Joins("LEFT JOIN subscriptions ON subscriptions.user_id = users.id AND subscriptions.status = 'active'").
		Where("users.id NOT IN ?", swipedIds)

	// Filtros básicos
	if myPrefs.Show == "Hombres" {
		query = query.Where("users.gender = ?", "Hombre")
	}
	if myPrefs.Show == "Mujeres" {
		query = query.Where("users.gender = ?", "Mujer")
	}
	if len(myPrefs.AgeRange) == 2 {
		query = query.Where("users.age >= ? AND users.age <= ?", myPrefs.AgeRange[0], myPrefs.AgeRange[1])
	}

	// --- ORDENAMIENTO DE VISIBILIDAD ---
	query = query.Order("boosts.id IS NOT NULL DESC").
		Order("subscriptions.plan = 'platinum' DESC").
		Order("RANDOM()")

	var users []models.User
	if err := query.Limit(20).Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando feed"})
	}

	return c.JSON(users)
}

// 4. ELIMINAR CUENTA
func DeleteAccount(c *fiber.Ctx) error {
	myId := c.Locals("userId")
	database.DB.Delete(&models.User{}, myId)
	return c.JSON(fiber.Map{"message": "Cuenta eliminada"})
}

// 5. CAMBIAR CONTRASEÑA (¡AGREGADA!)
func ChangePassword(c *fiber.Ctx) error {
	myId := c.Locals("userId")
	var user models.User
	if err := database.DB.First(&user, myId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	type ChangePasswordDTO struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	var data ChangePasswordDTO
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Verificar contraseña anterior
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Contraseña actual incorrecta"})
	}

	// Encriptar nueva contraseña
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(data.NewPassword), 14)
	user.Password = string(hashedPassword)

	database.DB.Save(&user)

	return c.JSON(fiber.Map{"message": "Contraseña actualizada"})
}
