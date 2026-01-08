package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// Helper para convertir []Interest (Objetos) a []string (Slugs) para el frontend
func mapInterests(interests []models.Interest) []string {
	list := make([]string, 0)
	for _, i := range interests {
		list = append(list, i.Slug)
	}
	return list
}

// 1. OBTENER MI PERFIL
func GetMe(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var user models.User

	// Usamos Preload("Interests") para cargar la relación
	if err := database.DB.Preload("Subscriptions", "status = ? AND end_date > ?", "active", time.Now()).
		Preload("Interests"). // <--- CRUCIAL
		First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	database.DB.Preload("Boosts", "expires_at > ?", time.Now()).First(&user, userId)

	role := "free"
	if len(user.Subscriptions) > 0 {
		role = user.Subscriptions[0].Plan
	}

	var matchCount int64
	database.DB.Model(&models.Match{}).Where("user1_id = ? OR user2_id = ?", user.ID, user.ID).Count(&matchCount)

	// Construimos la respuesta manual para enviar 'interests' como array de strings
	return c.JSON(fiber.Map{
		"id":          user.ID,
		"name":        user.Name,
		"email":       user.Email,
		"age":         user.Age,
		"photo":       user.Photo,
		"bio":         user.Bio,
		"interests":   mapInterests(user.Interests), // <--- USAMOS EL HELPER
		"preferences": user.Preferences,
		"role":        role,
		"match_count": matchCount,
		"has_boost":   len(user.Boosts) > 0,
		"is_verified": true, // Puedes conectar esto a la BD si agregas el campo
	})
}

// 2. OBTENER USUARIO POR ID (Para perfiles públicos)
func GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User

	if err := database.DB.Preload("Interests").First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Poblamos el campo virtual 'interests' antes de enviar
	user.InterestsList = mapInterests(user.Interests)
	user.Interests = nil // Limpiamos para que no se envíe el objeto complejo

	// Limpieza de seguridad
	user.Password = ""
	user.Email = ""

	return c.JSON(user)
}

// 3. ACTUALIZAR PERFIL
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
		Interests   []string    `json:"interests"` // ["gym", "music"]
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

	// ACTUALIZAR RELACIÓN DE INTERESES
	if input.Interests != nil {
		var newInterests []models.Interest
		// Buscamos los intereses por su slug
		database.DB.Where("slug IN ?", input.Interests).Find(&newInterests)

		// Reemplazamos la asociación existente
		database.DB.Model(&user).Association("Interests").Replace(newInterests)
	}

	if input.Preferences != nil {
		prefsJSON, _ := json.Marshal(input.Preferences)
		user.Preferences = string(prefsJSON)
	}

	database.DB.Save(&user)

	// Recargamos el usuario para devolver la data fresca y formateada
	database.DB.Preload("Interests").First(&user, userId)

	// Devolvemos respuesta formateada igual que GetMe
	return c.JSON(fiber.Map{
		"id":        user.ID,
		"name":      user.Name,
		"bio":       user.Bio,
		"photo":     user.Photo,
		"interests": mapInterests(user.Interests),
	})
}

// 4. OBTENER FEED
func GetFeed(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

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

	var swipedIds []uint
	database.DB.Model(&models.Like{}).Where("from_user_id = ?", myId).Pluck("to_user_id", &swipedIds)
	swipedIds = append(swipedIds, myId)

	// Query principal
	query := database.DB.Table("users").
		Select("users.*").
		Preload("Interests"). // Cargamos intereses para el feed también
		Joins("LEFT JOIN boosts ON boosts.user_id = users.id AND boosts.expires_at > ?", time.Now()).
		Joins("LEFT JOIN subscriptions ON subscriptions.user_id = users.id AND subscriptions.status = 'active'").
		Where("users.id NOT IN ?", swipedIds)

	if myPrefs.Show == "Hombres" {
		query = query.Where("users.gender = ?", "Hombre")
	}
	if myPrefs.Show == "Mujeres" {
		query = query.Where("users.gender = ?", "Mujer")
	}
	if len(myPrefs.AgeRange) == 2 {
		query = query.Where("users.age >= ? AND users.age <= ?", myPrefs.AgeRange[0], myPrefs.AgeRange[1])
	}

	query = query.Order("boosts.id IS NOT NULL DESC").
		Order("subscriptions.plan = 'platinum' DESC").
		Order("RANDOM()")

	var users []models.User
	if err := query.Limit(20).Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando feed"})
	}

	// Formateamos la respuesta para cada usuario del feed
	for i := range users {
		users[i].InterestsList = mapInterests(users[i].Interests)
		users[i].Interests = nil
		users[i].Password = ""
		users[i].Email = ""
	}

	return c.JSON(users)
}

// 5. ELIMINAR CUENTA
func DeleteAccount(c *fiber.Ctx) error {
	myId := c.Locals("userId")
	// GORM eliminará automáticamente las relaciones en la tabla intermedia user_interests
	database.DB.Delete(&models.User{}, myId)
	return c.JSON(fiber.Map{"message": "Cuenta eliminada"})
}

// 6. CAMBIAR CONTRASEÑA
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

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data.OldPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Contraseña actual incorrecta"})
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(data.NewPassword), 14)
	user.Password = string(hashedPassword)

	database.DB.Save(&user)

	return c.JSON(fiber.Map{"message": "Contraseña actualizada"})
}
