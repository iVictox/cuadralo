package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

	"github.com/gofiber/fiber/v2"
)

// 1. Obtener Perfil Público por Username
func GetProfileByUsername(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	username := c.Params("username")

	var user models.User
	// Buscar usuario (case insensitive en algunos DB, pero exacto aquí)
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Contadores (Estadísticas)
	var followersCount int64
	var followingCount int64
	database.DB.Model(&models.Follow{}).Where("following_id = ?", user.ID).Count(&followersCount)
	database.DB.Model(&models.Follow{}).Where("follower_id = ?", user.ID).Count(&followingCount)

	user.Followers = followersCount
	user.Following = followingCount

	// Verificar si YO lo sigo
	var followCheck models.Follow
	if database.DB.Where("follower_id = ? AND following_id = ?", myId, user.ID).First(&followCheck).RowsAffected > 0 {
		user.IsFollowing = true
	}

	// Traer sus Posts (Galería)
	var posts []models.Post
	database.DB.Where("user_id = ?", user.ID).Order("created_at desc").Find(&posts)

	// Inyectar datos de likes en posts para el visor
	for i := range posts {
		posts[i].LikesCount = database.DB.Model(&models.PostLike{}).Where("post_id = ?", posts[i].ID).Count(&posts[i].LikesCount).RowsAffected
	}

	return c.JSON(fiber.Map{
		"user":  user,
		"posts": posts,
	})
}

// 2. Seguir / Dejar de Seguir
func ToggleFollow(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetIdStr := c.Params("id") // ID del usuario a seguir

	var targetUser models.User
	if err := database.DB.First(&targetUser, targetIdStr).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if targetUser.ID == myId {
		return c.Status(400).JSON(fiber.Map{"error": "No puedes seguirte a ti mismo"})
	}

	var follow models.Follow
	result := database.DB.Where("follower_id = ? AND following_id = ?", myId, targetUser.ID).First(&follow)

	if result.RowsAffected > 0 {
		// UNFOLLOW
		database.DB.Delete(&follow)
		return c.JSON(fiber.Map{"following": false, "message": "Dejaste de seguir"})
	} else {
		// FOLLOW
		newFollow := models.Follow{FollowerID: myId, FollowingID: targetUser.ID}
		database.DB.Create(&newFollow)

		// Opcional: Crear notificación aquí

		return c.JSON(fiber.Map{"following": true, "message": "Siguiendo"})
	}
}
