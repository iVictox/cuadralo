package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type ProfileResponse struct {
	models.User
	MatchCount int64 `json:"match_count"`
}

// GetMe: Devuelve MI perfil + Conteo de Matches
func GetMe(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var user models.User

	// 1. Buscar Usuario
	if err := database.DB.Omit("password").First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// 2. Contar Matches (Donde soy User1 o User2)
	var count int64
	database.DB.Model(&models.Match{}).
		Where("user1_id = ? OR user2_id = ?", user.ID, user.ID).
		Count(&count)

	// 3. Devolver respuesta combinada
	response := ProfileResponse{
		User:       user,
		MatchCount: count,
	}

	return c.JSON(response)
}

// GetFeed: Devuelve usuarios filtrados por preferencias
func GetFeed(c *fiber.Ctx) error {
	// 1. Obtener mi ID
	myId := uint(c.Locals("userId").(float64))

	// 2. Obtener mis datos para leer preferencias
	var me models.User
	if err := database.DB.First(&me, myId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Estructura para leer el JSON de preferencias
	type Prefs struct {
		Distance int    `json:"distance"`
		Show     string `json:"show"` // "Hombres", "Mujeres", "Todos"
	}
	var myPrefs Prefs
	// Valor por defecto
	myPrefs.Show = "Todos"

	// Si hay preferencias guardadas, las leemos
	if me.Preferences != "" {
		json.Unmarshal([]byte(me.Preferences), &myPrefs)
	}

	// 3. Obtener lista de IDs que YA he visto (Likes o Dislikes)
	var swipedIds []uint
	database.DB.Model(&models.Like{}).Where("from_user_id = ?", myId).Pluck("to_user_id", &swipedIds)

	// Agregarme a mí mismo a la lista de excluidos
	swipedIds = append(swipedIds, myId)

	// 4. Construir la consulta
	// "Busca usuarios cuyo ID NO esté en la lista de swipedIds"
	query := database.DB.Omit("password").Where("id NOT IN ?", swipedIds)

	// 5. Aplicar filtro de GÉNERO
	if myPrefs.Show == "Hombres" {
		query = query.Where("gender = ?", "Hombre")
	} else if myPrefs.Show == "Mujeres" {
		query = query.Where("gender = ?", "Mujer")
	}
	// Si es "Todos", no filtramos por género

	// 6. Ejecutar consulta (Límite 20 para rapidez)
	var users []models.User
	if err := query.Limit(20).Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando feed"})
	}

	return c.JSON(users)
}

// DTO para actualizar perfil (Ahora incluye Preferences)
type UpdateUserDTO struct {
	Name        string      `json:"name"`
	Bio         string      `json:"bio"`
	Photo       string      `json:"photo"`
	Interests   []string    `json:"interests"`
	Preferences interface{} `json:"preferences"` // <--- NUEVO
}

// UpdateMe: Actualizar mi propio perfil
func UpdateMe(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var data UpdateUserDTO
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var user models.User
	database.DB.First(&user, userId)

	if data.Name != "" {
		user.Name = data.Name
	}
	if data.Bio != "" {
		user.Bio = data.Bio
	}
	if data.Photo != "" {
		user.Photo = data.Photo
	}

	if len(data.Interests) > 0 {
		importJson, _ := json.Marshal(data.Interests)
		user.Interests = string(importJson)
	}

	// NUEVO: Guardar Preferencias
	if data.Preferences != nil {
		prefJson, _ := json.Marshal(data.Preferences)
		user.Preferences = string(prefJson)
	}

	database.DB.Save(&user)
	return c.JSON(user)
}

// Estructura exacta para el frontend
type PasswordDTO struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

func ChangePassword(c *fiber.Ctx) error {
	userId := c.Locals("userId")
	var data PasswordDTO

	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// COMPARACIÓN: Asegúrate de que user.Password sea el hash de la BD
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data.OldPassword))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "La contraseña actual no coincide"})
	}

	// ENCRIPTACIÓN: Usamos 10 o 12 para que sea seguro pero rápido
	hashed, _ := bcrypt.GenerateFromPassword([]byte(data.NewPassword), 12)
	user.Password = string(hashed)

	database.DB.Save(&user)

	return c.JSON(fiber.Map{"message": "Contraseña actualizada exitosamente"})
}

// --- NUEVO: ELIMINAR CUENTA ---
func DeleteAccount(c *fiber.Ctx) error {
	userId := c.Locals("userId")

	// Borrar usuario (GORM lo borra físicamente o soft delete según modelo)
	// También deberíamos borrar sus likes, matches y mensajes para limpiar,
	// pero por simplicidad borramos el usuario principal.
	if err := database.DB.Delete(&models.User{}, userId).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error eliminando cuenta"})
	}

	return c.JSON(fiber.Map{"message": "Cuenta eliminada. Hasta pronto :("})
}
