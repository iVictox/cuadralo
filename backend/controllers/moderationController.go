package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// ==========================================
// 💬 CONVERSACIONES Y MENSAJES
// ==========================================

func GetAllMessagesAdmin(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	offset := (page - 1) * limit
	search := c.Query("search", "")

	query := database.DB.Model(&models.Message{}).Preload("Sender").Preload("Receiver")

	if search != "" {
		query = query.Where("content ILIKE ?", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var messages []models.Message
	if err := query.Order("created_at desc").Offset(offset).Limit(limit).Find(&messages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener mensajes"})
	}

	return c.JSON(fiber.Map{"messages": messages, "total": total, "page": page, "limit": limit})
}

func DeleteMessageAdmin(c *fiber.Ctx) error {
	msgID := c.Params("id")
	if err := database.DB.Delete(&models.Message{}, msgID).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al eliminar el mensaje"})
	}
	return c.JSON(fiber.Map{"message": "Mensaje eliminado del sistema"})
}

// ==========================================
// ❤️ MATCHES
// ==========================================

func GetAllMatchesAdmin(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Match{}).Preload("User1").Preload("User2")

	var total int64
	query.Count(&total)

	var matches []models.Match
	if err := query.Order("created_at desc").Offset(offset).Limit(limit).Find(&matches).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener matches"})
	}

	return c.JSON(fiber.Map{"matches": matches, "total": total, "page": page, "limit": limit})
}

func DeleteMatchAdmin(c *fiber.Ctx) error {
	matchID := c.Params("id")
	if err := database.DB.Delete(&models.Match{}, matchID).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al disolver el match"})
	}
	return c.JSON(fiber.Map{"message": "Match disuelto. Los usuarios ya no están conectados."})
}

// ==========================================
// 📝 POSTS Y COMENTARIOS
// ==========================================

func GetAllPostsAdmin(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset := (page - 1) * limit
	search := c.Query("search", "")

	query := database.DB.Model(&models.Post{}).Preload("User")

	if search != "" {
		query = query.Where("content ILIKE ?", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var posts []models.Post
	if err := query.Order("created_at desc").Offset(offset).Limit(limit).Find(&posts).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener posts"})
	}

	return c.JSON(fiber.Map{"posts": posts, "total": total, "page": page, "limit": limit})
}

func DeletePostAdmin(c *fiber.Ctx) error {
	postID := c.Params("id")
	if err := database.DB.Delete(&models.Post{}, postID).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al eliminar el post"})
	}
	return c.JSON(fiber.Map{"message": "Publicación eliminada."})
}

func GetAllCommentsAdmin(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	offset := (page - 1) * limit
	search := c.Query("search", "")

	query := database.DB.Model(&models.Comment{}).Preload("User").Preload("Post")

	if search != "" {
		query = query.Where("content ILIKE ?", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var comments []models.Comment
	if err := query.Order("created_at desc").Offset(offset).Limit(limit).Find(&comments).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener comentarios"})
	}

	return c.JSON(fiber.Map{"comments": comments, "total": total, "page": page, "limit": limit})
}

func DeleteCommentAdmin(c *fiber.Ctx) error {
	commentID := c.Params("id")
	if err := database.DB.Delete(&models.Comment{}, commentID).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al eliminar el comentario"})
	}
	return c.JSON(fiber.Map{"message": "Comentario eliminado."})
}

// ==========================================
// 📸 FOTOS Y MEDIA (Extrae imágenes de Posts)
// ==========================================

func GetAllMediaAdmin(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	offset := (page - 1) * limit

	// Buscar todos los posts que tengan imágenes
	query := database.DB.Model(&models.Post{}).Preload("User").Where("images IS NOT NULL AND images != '[]'")

	var total int64
	query.Count(&total)

	var posts []models.Post
	if err := query.Order("created_at desc").Offset(offset).Limit(limit).Find(&posts).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener media"})
	}

	return c.JSON(fiber.Map{"media": posts, "total": total, "page": page, "limit": limit})
}

// ==========================================
// 🚩 CONTENIDO MARCADO (Auto-Detección)
// ==========================================

func GetFlaggedContentAdmin(c *fiber.Ctx) error {
	// Lista básica de palabras a detectar (Idealmente esto iría en la BD más adelante)
	bannedWords := []string{"puta", "mierda", "matar", "droga", "nudes", "pack"}

	var flaggedPosts []models.Post
	postQuery := database.DB.Model(&models.Post{}).Preload("User")

	for i, word := range bannedWords {
		if i == 0 {
			postQuery = postQuery.Where("content ILIKE ?", "%"+word+"%")
		} else {
			postQuery = postQuery.Or("content ILIKE ?", "%"+word+"%")
		}
	}
	postQuery.Order("created_at desc").Limit(20).Find(&flaggedPosts)

	var flaggedComments []models.Comment
	commentQuery := database.DB.Model(&models.Comment{}).Preload("User").Preload("Post")

	for i, word := range bannedWords {
		if i == 0 {
			commentQuery = commentQuery.Where("content ILIKE ?", "%"+word+"%")
		} else {
			commentQuery = commentQuery.Or("content ILIKE ?", "%"+word+"%")
		}
	}
	commentQuery.Order("created_at desc").Limit(20).Find(&flaggedComments)

	return c.JSON(fiber.Map{
		"posts":    flaggedPosts,
		"comments": flaggedComments,
	})
}
