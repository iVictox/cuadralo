package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// 1. Crear Post
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

	post := models.Post{
		UserID:    userId,
		ImageURL:  data.ImageURL,
		Caption:   data.Caption,
		Location:  data.Location,
		CreatedAt: time.Now(),
	}

	database.DB.Create(&post)
	database.DB.Preload("User").First(&post, post.ID)

	return c.JSON(post)
}

// 2. Obtener Feed Social
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

// 3. Eliminar Post
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

	// Borrar dependencias del post
	database.DB.Where("post_id = ?", postId).Delete(&models.Comment{})
	database.DB.Where("post_id = ?", postId).Delete(&models.PostLike{})
	database.DB.Delete(&post)

	return c.JSON(fiber.Map{"message": "Post eliminado"})
}

// 4. Like Post
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
		database.DB.Model(&models.Post{}).Select("id").Where("id = ?", postId).Scan(&pID)
		if pID == 0 {
			return c.Status(404).JSON(fiber.Map{"error": "Post no existe"})
		}

		newLike := models.PostLike{UserID: userId, PostID: pID}
		database.DB.Create(&newLike)
		return c.JSON(fiber.Map{"liked": true})
	}
}

// 5. Reportar Post
func ReportPost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var data struct {
		Reason string `json:"reason"`
	}
	c.BodyParser(&data)

	var pID uint
	database.DB.Model(&models.Post{}).Select("id").Where("id = ?", postId).Scan(&pID)

	report := models.Report{
		UserID:    userId,
		PostID:    pID,
		Reason:    data.Reason,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&report)
	return c.JSON(fiber.Map{"message": "Reporte recibido"})
}

// ==========================================
// SECCIÓN DE COMENTARIOS
// ==========================================

// 6. Obtener Comentarios
func GetPostComments(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var comments []models.Comment
	if err := database.DB.Preload("User").Where("post_id = ?", postId).Order("created_at asc").Find(&comments).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando comentarios"})
	}

	for i := range comments {
		var count int64
		database.DB.Model(&models.CommentLike{}).Where("comment_id = ?", comments[i].ID).Count(&count)
		comments[i].LikesCount = count

		var like models.CommentLike
		if database.DB.Where("user_id = ? AND comment_id = ?", myId, comments[i].ID).First(&like).RowsAffected > 0 {
			comments[i].IsLiked = true
		}
	}

	return c.JSON(comments)
}

// 7. Crear Comentario
func CreateComment(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var data struct {
		Content  string `json:"content"`
		ParentID *uint  `json:"parent_id"`
	}

	if err := c.BodyParser(&data); err != nil || data.Content == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Comentario vacío"})
	}

	var pID uint
	if err := database.DB.Model(&models.Post{}).Select("id").Where("id = ?", postId).Scan(&pID).Error; err != nil || pID == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Post no encontrado"})
	}

	comment := models.Comment{
		PostID:    pID,
		UserID:    userId,
		Content:   data.Content,
		ParentID:  data.ParentID,
		CreatedAt: time.Now(),
	}

	database.DB.Create(&comment)
	database.DB.Preload("User").First(&comment, comment.ID)

	return c.JSON(comment)
}

// 8. Borrar Comentario (✅ CORREGIDO: Borrado en Cascada)
func DeleteComment(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	commentId := c.Params("id")

	var comment models.Comment
	if err := database.DB.First(&comment, commentId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Comentario no encontrado"})
	}

	if comment.UserID != userId {
		return c.Status(403).JSON(fiber.Map{"error": "No autorizado"})
	}

	// 1. Encontrar todas las respuestas (hijos)
	var replies []models.Comment
	database.DB.Where("parent_id = ?", commentId).Find(&replies)

	// 2. Borrar Likes de las respuestas
	for _, reply := range replies {
		database.DB.Where("comment_id = ?", reply.ID).Delete(&models.CommentLike{})
	}

	// 3. Borrar las Respuestas
	database.DB.Where("parent_id = ?", commentId).Delete(&models.Comment{})

	// 4. Borrar Likes del comentario principal
	database.DB.Where("comment_id = ?", commentId).Delete(&models.CommentLike{})

	// 5. Finalmente, borrar el comentario principal
	if err := database.DB.Delete(&comment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo eliminar el comentario"})
	}

	return c.JSON(fiber.Map{"message": "Comentario eliminado correctamente"})
}

// 9. Like Comentario
func ToggleCommentLike(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	commentId := c.Params("id")

	var like models.CommentLike
	result := database.DB.Where("user_id = ? AND comment_id = ?", userId, commentId).First(&like)

	if result.RowsAffected > 0 {
		database.DB.Delete(&like)
		return c.JSON(fiber.Map{"liked": false})
	} else {
		var cID uint
		database.DB.Model(&models.Comment{}).Select("id").Where("id = ?", commentId).Scan(&cID)
		if cID == 0 {
			return c.Status(404).JSON(fiber.Map{"error": "Comentario no existe"})
		}

		newLike := models.CommentLike{UserID: userId, CommentID: cID}
		database.DB.Create(&newLike)
		return c.JSON(fiber.Map{"liked": true})
	}
}

// ==========================================
// SECCIÓN DE HISTORIAS
// ==========================================
func GetActiveStories(c *fiber.Ctx) error {
	type StoryGroup struct {
		User    models.User    `json:"user"`
		Stories []models.Story `json:"stories"`
	}
	var activeStories []models.Story
	database.DB.Preload("User").Where("expires_at > ?", time.Now()).Order("created_at asc").Find(&activeStories)
	grouped := make(map[uint]*StoryGroup)
	var result []StoryGroup
	for _, s := range activeStories {
		if _, exists := grouped[s.UserID]; !exists {
			grouped[s.UserID] = &StoryGroup{User: s.User, Stories: []models.Story{}}
		}
		entry := grouped[s.UserID]
		entry.Stories = append(entry.Stories, s)
	}
	for _, g := range grouped {
		result = append(result, *g)
	}
	return c.JSON(result)
}

func CreateStory(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var data struct {
		ImageURL string `json:"image_url"`
	}
	c.BodyParser(&data)
	story := models.Story{
		UserID:    userId,
		ImageURL:  data.ImageURL,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		CreatedAt: time.Now(),
	}
	database.DB.Create(&story)
	return c.JSON(story)
}

func DeleteStory(c *fiber.Ctx) error { return c.JSON(fiber.Map{"message": "Ok"}) }
