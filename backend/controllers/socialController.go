package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

func CreatePost(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	var data struct {
		ImageURL string `json:"image_url"`
		Caption  string `json:"caption"`
		Location string `json:"location"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	post := models.Post{UserID: myId, ImageURL: data.ImageURL, Caption: data.Caption, Location: data.Location}
	database.DB.Create(&post)
	database.DB.Preload("User").First(&post, post.ID)
	return c.JSON(post)
}

func GetSocialFeed(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	var posts []models.Post
	database.DB.Preload("User").Preload("Likes").Order("created_at desc").Find(&posts)

	// Preparamos cache de historias para no hacer 1000 consultas
	// Mapa: UserID -> Bool (Tiene historia?)
	activeStoriesMap := make(map[uint]bool)
	var activeUserIDs []uint

	// Buscamos usuarios únicos con historias activas
	database.DB.Model(&models.Story{}).
		Where("expires_at > ?", time.Now()).
		Distinct("user_id").
		Pluck("user_id", &activeUserIDs)

	for _, id := range activeUserIDs {
		activeStoriesMap[id] = true
	}

	for i := range posts {
		// 1. Likes Logic
		posts[i].LikesCount = int64(len(posts[i].Likes))
		for _, like := range posts[i].Likes {
			if like.UserID == myId {
				posts[i].IsLiked = true
				break
			}
		}
		posts[i].Likes = nil

		// 2. Has Story Logic (NUEVO)
		if activeStoriesMap[posts[i].UserID] {
			posts[i].User.HasStory = true
		}
	}

	return c.JSON(posts)
}

func TogglePostLike(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")
	var like models.PostLike
	result := database.DB.Where("user_id = ? AND post_id = ?", myId, postId).First(&like)
	if result.RowsAffected > 0 {
		database.DB.Delete(&like)
		return c.JSON(fiber.Map{"liked": false})
	} else {
		database.DB.Exec("INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)", myId, postId)
		return c.JSON(fiber.Map{"liked": true})
	}
}

// --- COMENTARIOS (MEJORADO) ---

// 4. Crear Comentario (Soporta Respuestas)
func CreateComment(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var data struct {
		Content  string `json:"content"`
		ParentID *uint  `json:"parent_id"` // Opcional, si es respuesta
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var post models.Post
	if err := database.DB.First(&post, postId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post no encontrado"})
	}

	comment := models.Comment{
		UserID:   myId,
		PostID:   post.ID,
		Content:  data.Content,
		ParentID: data.ParentID, // Se guarda si existe
	}

	database.DB.Create(&comment)
	database.DB.Preload("User").First(&comment, comment.ID)

	return c.JSON(comment)
}

// 5. Obtener Comentarios (Con Likes y Respuestas)
func GetPostComments(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var comments []models.Comment

	// Traemos solo los comentarios PRINCIPALES (ParentID IS NULL)
	// Y precargamos sus Respuestas (Replies) y los datos necesarios
	database.DB.
		Where("post_id = ? AND parent_id IS NULL", postId).
		Preload("User").
		Preload("Likes").
		Preload("Replies").Preload("Replies.User").Preload("Replies.Likes"). // Cargar respuestas y sus datos
		Order("created_at asc").
		Find(&comments)

	// Función auxiliar para procesar likes de un comentario
	processComment := func(c *models.Comment) {
		c.LikesCount = int64(len(c.Likes))
		for _, like := range c.Likes {
			if like.UserID == myId {
				c.IsLiked = true
				break
			}
		}
		c.Likes = nil // Limpiar para no enviar JSON gigante
	}

	// Procesar principales y sus respuestas
	for i := range comments {
		processComment(&comments[i])
		for j := range comments[i].Replies {
			processComment(&comments[i].Replies[j])
		}
	}

	return c.JSON(comments)
}

// 6. Eliminar Comentario
func DeleteComment(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	commentId := c.Params("id")
	var comment models.Comment
	if err := database.DB.First(&comment, commentId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No encontrado"})
	}

	// Verificar permisos (Dueño del comentario o del post)
	var post models.Post
	database.DB.First(&post, comment.PostID)

	if comment.UserID != myId && post.UserID != myId {
		return c.Status(403).JSON(fiber.Map{"error": "Sin permiso"})
	}

	// Borrar comentario y sus respuestas (Cascada manual si BD no lo tiene)
	database.DB.Where("parent_id = ?", comment.ID).Delete(&models.Comment{})
	database.DB.Delete(&comment)

	return c.JSON(fiber.Map{"message": "Eliminado"})
}

// 7. Toggle Like Comentario (NUEVO)
func ToggleCommentLike(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	commentId := c.Params("id")

	var like models.CommentLike
	result := database.DB.Where("user_id = ? AND comment_id = ?", myId, commentId).First(&like)

	if result.RowsAffected > 0 {
		database.DB.Delete(&like)
		return c.JSON(fiber.Map{"liked": false})
	} else {
		database.DB.Exec("INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)", myId, commentId)
		return c.JSON(fiber.Map{"liked": true})
	}
}

// --- HISTORIAS --- (Sin cambios)
func CreateStory(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	var data struct {
		ImageURL string `json:"image_url"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Falta imagen"})
	}
	story := models.Story{UserID: myId, ImageURL: data.ImageURL, ExpiresAt: time.Now().Add(24 * time.Hour)}
	database.DB.Create(&story)
	return c.JSON(story)
}

func GetActiveStories(c *fiber.Ctx) error {
	var stories []models.Story
	database.DB.Where("expires_at > ?", time.Now()).Preload("User").Order("created_at asc").Find(&stories)
	type UserStories struct {
		User    models.User    `json:"user"`
		Stories []models.Story `json:"stories"`
	}
	grouped := make(map[uint]*UserStories)
	var result []UserStories
	for _, s := range stories {
		if _, exists := grouped[s.UserID]; !exists {
			grouped[s.UserID] = &UserStories{User: s.User, Stories: []models.Story{}}
		}
		grouped[s.UserID].Stories = append(grouped[s.UserID].Stories, s)
	}
	for _, v := range grouped {
		result = append(result, *v)
	}
	return c.JSON(result)
}

// 9. Eliminar Post
func DeletePost(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	// Iniciar Transacción (Todo o nada)
	tx := database.DB.Begin()

	var post models.Post
	if err := tx.First(&post, postId).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Post no encontrado"})
	}

	// Verificar dueño
	if post.UserID != myId {
		tx.Rollback()
		return c.Status(403).JSON(fiber.Map{"error": "No eres el dueño de este post"})
	}

	// 1. Borrar Likes del Post
	if err := tx.Where("post_id = ?", post.ID).Delete(&models.PostLike{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Error borrando likes del post"})
	}

	// 2. Borrar Reportes del Post
	if err := tx.Where("post_id = ?", post.ID).Delete(&models.Report{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Error borrando reportes"})
	}

	// 3. LIMPIEZA PROFUNDA DE COMENTARIOS
	// Primero: Obtener IDs de los comentarios de este post
	var commentIDs []uint
	tx.Model(&models.Comment{}).Where("post_id = ?", post.ID).Pluck("id", &commentIDs)

	if len(commentIDs) > 0 {
		// A. Borrar Likes de esos comentarios (CRÍTICO: Esto era lo que faltaba)
		if err := tx.Where("comment_id IN ?", commentIDs).Delete(&models.CommentLike{}).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "Error borrando likes de comentarios"})
		}

		// B. Borrar los Comentarios en sí
		if err := tx.Where("id IN ?", commentIDs).Delete(&models.Comment{}).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "Error borrando comentarios"})
		}
	}

	// 4. Finalmente, Borrar el Post
	if err := tx.Delete(&post).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Error final borrando el post"})
	}

	// Confirmar cambios
	tx.Commit()

	return c.JSON(fiber.Map{"message": "Post eliminado correctamente"})
}

// 10. Reportar Post
func ReportPost(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var data struct {
		Reason string `json:"reason"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Verificar si el post existe
	var post models.Post
	if err := database.DB.First(&post, postId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post no encontrado"})
	}

	// Crear reporte
	report := models.Report{
		ReporterID: myId,
		PostID:     post.ID,
		Reason:     data.Reason,
	}
	database.DB.Create(&report)

	return c.JSON(fiber.Map{"message": "Reporte enviado. Gracias por ayudarnos."})
}

func DeleteStory(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	storyId := c.Params("id")

	var story models.Story
	if err := database.DB.First(&story, storyId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Historia no encontrada"})
	}

	if story.UserID != myId {
		return c.Status(403).JSON(fiber.Map{"error": "No puedes borrar la historia de otro"})
	}

	database.DB.Delete(&story)
	return c.JSON(fiber.Map{"message": "Historia eliminada"})
}
