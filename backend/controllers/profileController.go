package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/websockets"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetProfileByUsername(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	username := c.Params("username")

	var user models.User
	if err := database.DB.Preload("Interests").Where("username = ?", username).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Calcular Estadísticas
	var followersCount, followingCount int64
	database.DB.Model(&models.Follow{}).Where("following_id = ?", user.ID).Count(&followersCount)
	database.DB.Model(&models.Follow{}).Where("follower_id = ?", user.ID).Count(&followingCount)
	user.FollowersCount = int(followersCount)
	user.FollowingCount = int(followingCount)

	user.InterestsList = []string{}
	for _, i := range user.Interests {
		user.InterestsList = append(user.InterestsList, i.Slug)
	}

	var followCheck models.Follow
	if database.DB.Where("follower_id = ? AND following_id = ?", myId, user.ID).First(&followCheck).RowsAffected > 0 {
		user.IsFollowing = true
	}

	return c.JSON(user)
}

// ✅ Función renombrada para routes.go
func FollowUser(c *fiber.Ctx) error {
	followerID := uint(c.Locals("userId").(float64))
	followingIDStr := c.Params("id")

	var followingID uint
	fmt.Sscanf(followingIDStr, "%d", &followingID)

	if followerID == followingID {
		return c.Status(400).JSON(fiber.Map{"error": "No puedes seguirte a ti mismo"})
	}

	var follow models.Follow
	result := database.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&follow)

	if result.RowsAffected > 0 {
		database.DB.Delete(&follow)
		return c.JSON(fiber.Map{"message": "Dejaste de seguir al usuario", "following": false})
	}

	newFollow := models.Follow{
		FollowerID:  followerID,
		FollowingID: followingID,
		CreatedAt:   time.Now(),
	}
	database.DB.Create(&newFollow)

	// 🚀 DISPARAMOS LA NOTIFICACIÓN DE NUEVO SEGUIDOR
	// Como no es un post, le enviamos "nil" en el ID de publicación
	websockets.SendToUser(fmt.Sprintf("%d", followingID), "new_notification", nil) // Llamada temporal si la función helper no está exportada, o si tienes tu propia lógica de notificación.

	// NOTA: Como la función CreateAndBroadcastNotification está en socialController,
	// la forma más fácil es replicar la lógica pequeña aquí:
	notif := models.Notification{
		UserID:    followingID,
		SenderID:  followerID,
		Type:      "follow",
		PostID:    nil,
		Message:   "ha comenzado a seguirte.",
		IsRead:    false,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&notif)
	database.DB.Preload("Sender").First(&notif, notif.ID)
	websockets.SendToUser(fmt.Sprintf("%d", followingID), "new_notification", notif)

	return c.JSON(fiber.Map{"message": "Usuario seguido", "following": true})
}
