package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// 1. Obtener Perfil Público por Username
func GetProfileByUsername(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	username := c.Params("username")

	var user models.User
	// Buscar usuario
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Calcular Estadísticas
	var followersCount int64
	var followingCount int64
	database.DB.Model(&models.Follow{}).Where("following_id = ?", user.ID).Count(&followersCount)
	database.DB.Model(&models.Follow{}).Where("follower_id = ?", user.ID).Count(&followingCount)

	// Asignar los valores convertidos a int
	user.FollowersCount = int(followersCount)
	user.FollowingCount = int(followingCount)

	// Verificar si YO lo sigo
	var followCheck models.Follow
	if database.DB.Where("follower_id = ? AND following_id = ?", myId, user.ID).First(&followCheck).RowsAffected > 0 {
		user.IsFollowing = true
	}

	// Verificar si tiene Historia Activa (Para el perfil principal)
	var activeStory models.Story
	if database.DB.Where("user_id = ? AND expires_at > ?", user.ID, time.Now()).First(&activeStory).RowsAffected > 0 {
		user.HasStory = true
	}

	// --- Traer Posts con Usuario y Likes ---
	var posts []models.Post
	database.DB.Preload("User").Where("user_id = ?", user.ID).Order("created_at desc").Find(&posts)

	// Procesar cada post para ver likes y estado
	for i := range posts {
		// 1. Contar Likes
		database.DB.Model(&models.PostLike{}).Where("post_id = ?", posts[i].ID).Count(&posts[i].LikesCount)

		// 2. ¿Yo le di like?
		var likeCheck models.PostLike
		if database.DB.Where("user_id = ? AND post_id = ?", myId, posts[i].ID).First(&likeCheck).RowsAffected > 0 {
			posts[i].IsLiked = true
		}

		// 3. Asegurar que el objeto User del post tenga el flag de historia
		posts[i].User.HasStory = user.HasStory
	}

	return c.JSON(fiber.Map{
		"user":  user,
		"posts": posts,
	})
}

// 2. Seguir / Dejar de Seguir
func ToggleFollow(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetIdStr := c.Params("id")

	var targetUser models.User
	if err := database.DB.First(&targetUser, targetIdStr).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario objetivo no encontrado"})
	}

	if targetUser.ID == myId {
		return c.Status(400).JSON(fiber.Map{"error": "No puedes seguirte a ti mismo"})
	}

	var follow models.Follow
	result := database.DB.Where("follower_id = ? AND following_id = ?", myId, targetUser.ID).First(&follow)

	if result.RowsAffected > 0 {
		database.DB.Delete(&follow)
		return c.JSON(fiber.Map{"following": false, "message": "Dejaste de seguir"})
	} else {
		newFollow := models.Follow{FollowerID: myId, FollowingID: targetUser.ID}
		database.DB.Create(&newFollow)
		return c.JSON(fiber.Map{"following": true, "message": "Siguiendo"})
	}
}
