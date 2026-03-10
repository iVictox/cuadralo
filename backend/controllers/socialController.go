package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/websockets"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

// --- POSTS ---

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

	// 1. Obtener Posts
	database.DB.Preload("User").Order("created_at desc").Find(&posts)

	if len(posts) == 0 {
		return c.JSON([]models.Post{})
	}

	// 2. Obtener IDs de usuarios en el feed
	userIDs := make([]uint, 0)
	for _, p := range posts {
		userIDs = append(userIDs, p.UserID)
	}

	// 3. Buscar todas las historias activas de esos usuarios
	var activeStories []models.Story
	database.DB.Where("user_id IN ? AND expires_at > ?", userIDs, time.Now()).Find(&activeStories)

	// 4. Buscar cuáles de esas historias YA he visto yo
	var myViews []models.StoryView
	storyIDs := make([]uint, 0)
	for _, s := range activeStories {
		storyIDs = append(storyIDs, s.ID)
	}
	if len(storyIDs) > 0 {
		database.DB.Where("user_id = ? AND story_id IN ?", myId, storyIDs).Find(&myViews)
	}

	seenMap := make(map[uint]bool)
	for _, v := range myViews {
		seenMap[v.StoryID] = true
	}

	// 5. Determinar estado por usuario
	type UserStatus struct {
		HasStory       bool
		HasUnseenStory bool
	}
	userStatusMap := make(map[uint]*UserStatus)

	for _, s := range activeStories {
		if _, exists := userStatusMap[s.UserID]; !exists {
			userStatusMap[s.UserID] = &UserStatus{HasStory: true, HasUnseenStory: false}
		}
		if !seenMap[s.ID] {
			userStatusMap[s.UserID].HasUnseenStory = true
		}
	}

	// 6. Asignar datos a los posts
	for i := range posts {
		var count int64
		database.DB.Model(&models.PostLike{}).Where("post_id = ?", posts[i].ID).Count(&count)
		posts[i].LikesCount = count

		var like models.PostLike
		if database.DB.Where("user_id = ? AND post_id = ?", myId, posts[i].ID).First(&like).RowsAffected > 0 {
			posts[i].IsLiked = true
		}

		if status, ok := userStatusMap[posts[i].UserID]; ok {
			posts[i].User.HasStory = true
			posts[i].User.HasUnseenStory = status.HasUnseenStory
		} else {
			posts[i].User.HasStory = false
			posts[i].User.HasUnseenStory = false
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

// ✅ NUEVO: Obtener los posts específicos de un usuario para su perfil
func GetUserPosts(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	targetUserId := c.Params("id")

	var posts []models.Post
	database.DB.Preload("User").Where("user_id = ?", targetUserId).Order("created_at desc").Find(&posts)

	for i := range posts {
		var count int64
		database.DB.Model(&models.PostLike{}).Where("post_id = ?", posts[i].ID).Count(&count)
		posts[i].LikesCount = count

		var like models.PostLike
		if database.DB.Where("user_id = ? AND post_id = ?", myId, posts[i].ID).First(&like).RowsAffected > 0 {
			posts[i].IsLiked = true
		}
	}

	return c.JSON(posts)
}

// --- COMENTARIOS ---

func GetPostComments(c *fiber.Ctx) error {
	postId := c.Params("id")
	var comments []models.Comment
	database.DB.Preload("User").Where("post_id = ?", postId).Order("created_at asc").Find(&comments)
	return c.JSON(comments)
}

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

// --- NOTIFICACIONES ---

func GetNotifications(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var notifs []models.Notification
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

// --- HISTORIAS ---

type StoryFeedItem struct {
	User    models.User    `json:"user"`
	Stories []models.Story `json:"stories"`
	AllSeen bool           `json:"all_seen"`
}

func GetActiveStories(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	var activeStories []models.Story
	database.DB.Preload("User").Where("expires_at > ?", time.Now()).Order("created_at asc").Find(&activeStories)

	var myViews []models.StoryView
	database.DB.Where("user_id = ?", myId).Find(&myViews)
	seenMap := make(map[uint]bool)
	for _, v := range myViews {
		seenMap[v.StoryID] = true
	}

	grouped := make(map[uint]*StoryFeedItem)
	var userOrder []uint

	for _, s := range activeStories {
		s.Seen = seenMap[s.ID]

		if _, exists := grouped[s.UserID]; !exists {
			grouped[s.UserID] = &StoryFeedItem{
				User:    s.User,
				Stories: []models.Story{},
				AllSeen: true,
			}
			userOrder = append(userOrder, s.UserID)
		}

		grouped[s.UserID].Stories = append(grouped[s.UserID].Stories, s)

		if !s.Seen {
			grouped[s.UserID].AllSeen = false
		}
	}

	var result []StoryFeedItem
	var seenResult []StoryFeedItem
	var unseenResult []StoryFeedItem

	for _, uid := range userOrder {
		item := grouped[uid]
		if uid == myId {
			continue
		}

		if item.AllSeen {
			seenResult = append(seenResult, *item)
		} else {
			unseenResult = append(unseenResult, *item)
		}
	}
	result = append(unseenResult, seenResult...)

	var myStories []models.Story
	if myItem, ok := grouped[myId]; ok {
		myStories = myItem.Stories

		for i := range myStories {
			var count int64
			database.DB.Model(&models.StoryView{}).Where("story_id = ?", myStories[i].ID).Count(&count)
			myStories[i].ViewsCount = count
		}
	}

	return c.JSON(fiber.Map{
		"feed":       result,
		"my_stories": myStories,
	})
}

func CreateStory(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var data struct {
		ImageURL string `json:"image_url"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	story := models.Story{
		UserID:    userId,
		ImageURL:  data.ImageURL,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	database.DB.Create(&story)
	database.DB.Preload("User").First(&story, story.ID)
	websockets.BroadcastEvent("new_story", story)

	return c.JSON(story)
}

func DeleteStory(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	storyId := c.Params("id")

	var story models.Story
	if err := database.DB.First(&story, storyId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No encontrada"})
	}
	if story.UserID != myId {
		return c.Status(403).JSON(fiber.Map{"error": "No autorizado"})
	}
	database.DB.Delete(&story)
	return c.JSON(fiber.Map{"message": "Historia eliminada"})
}

func ViewStory(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	storyId := c.Params("id")

	var existing models.StoryView
	if database.DB.Where("user_id = ? AND story_id = ?", userId, storyId).First(&existing).RowsAffected > 0 {
		return c.JSON(fiber.Map{"ok": true})
	}

	database.DB.Exec("INSERT INTO story_views (user_id, story_id, created_at) VALUES (?, ?, ?)", userId, storyId, time.Now())

	websockets.SendToUser(fmt.Sprintf("%d", userId), "story_viewed", fiber.Map{
		"story_id": storyId,
		"user_id":  userId,
	})

	var story models.Story
	if err := database.DB.Select("user_id").First(&story, storyId).Error; err == nil {
		websockets.SendToUser(strconv.Itoa(int(story.UserID)), "story_seen_by", fiber.Map{
			"story_id": storyId,
			"viewer":   userId,
		})
	}

	return c.JSON(fiber.Map{"ok": true})
}

func GetStoryViewers(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	storyId := c.Params("id")

	var story models.Story
	if err := database.DB.First(&story, storyId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Historia no encontrada"})
	}

	if story.UserID != myId {
		return c.Status(403).JSON(fiber.Map{"error": "No tienes permiso"})
	}

	var views []models.StoryView
	database.DB.Preload("User").Where("story_id = ?", storyId).Order("created_at desc").Find(&views)

	return c.JSON(views)
}
