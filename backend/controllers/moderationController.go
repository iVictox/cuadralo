package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// ==========================================
// 🗨️ CONVERSACIONES (Agrupadas e Historial)
// ==========================================

func GetAllConversationsAdmin(c *fiber.Ctx) error {
	search := c.Query("search", "")

	type ConversationResult struct {
		User1ID    uint   `json:"user1_id"`
		User1Name  string `json:"user1_name"`
		User1Photo string `json:"user1_photo"`
		User2ID    uint   `json:"user2_id"`
		User2Name  string `json:"user2_name"`
		User2Photo string `json:"user2_photo"`
		LastMsg    string `json:"last_message"`
		Date       string `json:"date"`
	}

	var convs []ConversationResult

	baseQuery := `
	SELECT 
		u1.id as user1_id, u1.username as user1_name, u1.photo as user1_photo,
		u2.id as user2_id, u2.username as user2_name, u2.photo as user2_photo,
		m.content as last_msg, m.created_at as date
	FROM messages m
	JOIN users u1 ON m.sender_id = u1.id
	JOIN users u2 ON m.receiver_id = u2.id
	WHERE m.id IN (
		SELECT MAX(id)
		FROM messages
		GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
	)`

	if search != "" {
		baseQuery += ` AND (u1.username ILIKE ? OR u2.username ILIKE ? OR u1.name ILIKE ? OR u2.name ILIKE ?) ORDER BY m.created_at DESC LIMIT 100;`
		searchTerm := "%" + search + "%"
		if err := database.DB.Raw(baseQuery, searchTerm, searchTerm, searchTerm, searchTerm).Scan(&convs).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error al obtener conversaciones filtradas"})
		}
	} else {
		baseQuery += ` ORDER BY m.created_at DESC LIMIT 100;`
		if err := database.DB.Raw(baseQuery).Scan(&convs).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error al obtener conversaciones"})
		}
	}

	return c.JSON(fiber.Map{"conversations": convs})
}

// ✅ NUEVO: Obtiene todo el historial de chat entre dos usuarios específicos
func GetFullConversationAdmin(c *fiber.Ctx) error {
	u1 := c.Query("u1")
	u2 := c.Query("u2")

	if u1 == "" || u2 == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Faltan parámetros de usuarios"})
	}

	var messages []models.Message
	if err := database.DB.Preload("Sender").Preload("Receiver").
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", u1, u2, u2, u1).
		Order("created_at asc").
		Find(&messages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener el historial"})
	}

	return c.JSON(fiber.Map{"messages": messages})
}

func DeleteConversationAdmin(c *fiber.Ctx) error {
	u1 := c.Query("u1")
	u2 := c.Query("u2")

	if u1 == "" || u2 == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Faltan parámetros de usuarios"})
	}

	if err := database.DB.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", u1, u2, u2, u1).Delete(&models.Message{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al eliminar la conversación"})
	}

	return c.JSON(fiber.Map{"message": "Conversación eliminada por completo."})
}

// ==========================================
// 💬 MENSAJES INDIVIDUALES
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
