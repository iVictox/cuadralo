package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

func CreatePost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var data struct {
		ImageURL string `json:"image_url"`
		Caption  string `json:"caption"`
		Location string `json:"location"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	post := models.Post{UserID: userId, ImageURL: data.ImageURL, Caption: data.Caption, Location: data.Location, CreatedAt: time.Now()}
	database.DB.Create(&post)
	database.DB.Preload("User").First(&post, post.ID)
	return c.JSON(post)
}

func GetSocialFeed(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	var posts []models.Post
	database.DB.Preload("User").Order("created_at desc").Find(&posts)
	activeStoriesMap := make(map[uint]bool)
	var activeUserIDs []uint
	database.DB.Model(&models.Story{}).Where("expires_at > ?", time.Now()).Distinct("user_id").Pluck("user_id", &activeUserIDs)
	for _, id := range activeUserIDs {
		activeStoriesMap[id] = true
	}
	for i := range posts {
		var count int64
		database.DB.Model(&models.PostLike{}).Where("post_id = ?", posts[i].ID).Count(&count)
		posts[i].LikesCount = count
		var like models.PostLike
		if database.DB.Where("user_id = ? AND post_id = ?", myId, posts[i].ID).First(&like).RowsAffected > 0 {
			posts[i].IsLiked = true
		}
		if activeStoriesMap[posts[i].UserID] {
			posts[i].User.HasStory = true
		}
	}
	return c.JSON(posts)
}

func DeletePost(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")
	var post models.Post
	if err := database.DB.First(&post, postId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post no encontrado"})
	}
	if post.UserID != myId {
		return c.Status(403).JSON(fiber.Map{"error": "No tienes permiso"})
	}
	database.DB.Where("post_id = ?", postId).Delete(&models.Comment{})
	database.DB.Where("post_id = ?", postId).Delete(&models.PostLike{})
	database.DB.Delete(&post)
	return c.JSON(fiber.Map{"message": "Post eliminado"})
}

// ✅ MODIFICADO: Like con Notificación
func TogglePostLike(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var like models.PostLike
	result := database.DB.Where("user_id = ? AND post_id = ?", userId, postId).First(&like)

	if result.RowsAffected > 0 {
		database.DB.Delete(&like)
		return c.JSON(fiber.Map{"liked": false})
	} else {
		var pID uint
		var postOwnerID uint
		database.DB.Model(&models.Post{}).Where("id = ?", postId).Select("id", "user_id").Row().Scan(&pID, &postOwnerID)

		if pID == 0 {
			return c.Status(404).JSON(fiber.Map{"error": "Post no existe"})
		}

		newLike := models.PostLike{UserID: userId, PostID: pID}
		database.DB.Create(&newLike)

		// 🔔 Crear Notificación
		if postOwnerID != userId {
			notif := models.Notification{
				UserID:    postOwnerID,
				SenderID:  userId,
				Type:      "like",
				PostID:    &pID,
				Message:   "le gustó tu publicación",
				CreatedAt: time.Now(),
			}
			database.DB.Create(&notif)
		}

		return c.JSON(fiber.Map{"liked": true})
	}
}

func ReportPost(c *fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) }

func GetPostComments(c *fiber.Ctx) error {
	postId := c.Params("id")
	var comments []models.Comment
	database.DB.Preload("User").Where("post_id = ?", postId).Order("created_at asc").Find(&comments)
	return c.JSON(comments)
}

// ✅ MODIFICADO: Comentario con Notificación
func CreateComment(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var data struct {
		Content  string `json:"content"`
		ParentID *uint  `json:"parent_id"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Error"})
	}

	var pID uint
	var postOwnerID uint
	database.DB.Model(&models.Post{}).Where("id = ?", postId).Select("id", "user_id").Row().Scan(&pID, &postOwnerID)

	comment := models.Comment{PostID: pID, UserID: userId, Content: data.Content, ParentID: data.ParentID, CreatedAt: time.Now()}
	database.DB.Create(&comment)
	database.DB.Preload("User").First(&comment, comment.ID)

	// 🔔 Crear Notificación
	targetUserID := postOwnerID
	msg := "comentó tu publicación"

	if data.ParentID != nil {
		var parentComm models.Comment
		database.DB.First(&parentComm, *data.ParentID)
		targetUserID = parentComm.UserID
		msg = "respondió a tu comentario"
	}

	if targetUserID != userId {
		notif := models.Notification{
			UserID:    targetUserID,
			SenderID:  userId,
			Type:      "comment",
			PostID:    &pID,
			Message:   msg,
			CreatedAt: time.Now(),
		}
		database.DB.Create(&notif)
	}

	return c.JSON(comment)
}

func DeleteComment(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	commentId := c.Params("id")
	var comment models.Comment
	database.DB.First(&comment, commentId)
	if comment.UserID != userId {
		return c.Status(403).JSON(fiber.Map{"error": "No autorizado"})
	}
	database.DB.Delete(&comment)
	return c.JSON(fiber.Map{"message": "Eliminado"})
}

func ToggleCommentLike(c *fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) }

// ==========================================
// ✅ SECCIÓN NOTIFICACIONES (NUEVA)
// ==========================================

func GetNotifications(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var notifs []models.Notification
	// Preload Post para saber la imagen si es like/comment
	database.DB.Preload("Sender").Preload("Post").Where("user_id = ?", userId).Order("created_at desc").Limit(50).Find(&notifs)
	return c.JSON(notifs)
}

func MarkNotificationRead(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	notifId := c.Params("id")

	if notifId == "all" {
		database.DB.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userId, false).Update("is_read", true)
		return c.JSON(fiber.Map{"message": "Todas leídas"})
	}

	var notif models.Notification
	if err := database.DB.Where("id = ? AND user_id = ?", notifId, userId).First(&notif).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No encontrada"})
	}

	notif.IsRead = true
	database.DB.Save(&notif)
	return c.JSON(notif)
}

func GetActiveStories(c *fiber.Ctx) error { return c.JSON([]interface{}{}) }
func CreateStory(c *fiber.Ctx) error      { return c.JSON(fiber.Map{"ok": true}) }
func DeleteStory(c *fiber.Ctx) error      { return c.JSON(fiber.Map{"ok": true}) }
