package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
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
	myId := uint(c.Locals("userId").(float64))
	targetId := c.Params("id")

	var follow models.Follow
	result := database.DB.Where("follower_id = ? AND following_id = ?", myId, targetId).First(&follow)

	if result.RowsAffected > 0 {
		database.DB.Delete(&follow)
		return c.JSON(fiber.Map{"status": "unfollowed", "following": false})
	} else {
		targetIDUint, _ := c.ParamsInt("id")
		if myId == uint(targetIDUint) {
			return c.Status(400).JSON(fiber.Map{"error": "No puedes seguirte a ti mismo"})
		}

		newFollow := models.Follow{FollowerID: myId, FollowingID: uint(targetIDUint), CreatedAt: time.Now()}
		database.DB.Create(&newFollow)

		notif := models.Notification{
			UserID:    uint(targetIDUint),
			SenderID:  myId,
			Type:      "follow",
			Message:   "te ha empezado a seguir",
			CreatedAt: time.Now(),
		}
		database.DB.Create(&notif)

		return c.JSON(fiber.Map{"status": "followed", "following": true})
	}
}
