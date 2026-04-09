package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"fmt"
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
// 📸 GALERÍA CENTRAL DE MEDIA (Multiorigen)
// ==========================================

type MediaResponse struct {
	ID       string `json:"id"`
	URL      string `json:"url"`
	Type     string `json:"type"`
	SourceID uint   `json:"source_id"`
	Username string `json:"username"`
	UserPic  string `json:"user_pic"`
	Date     string `json:"date"`
}

func GetAllMediaAdmin(c *fiber.Ctx) error {
	filter := c.Query("filter", "posts")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "40"))
	offset := (page - 1) * limit

	var mediaList []MediaResponse
	var total int64

	// ✅ FIX CRÍTICO: Buscar ImageURL en vez de Images
	if filter == "posts" {
		var posts []models.Post
		query := database.DB.Model(&models.Post{}).Where("image_url IS NOT NULL AND image_url != ''")
		query.Count(&total)
		query.Preload("User").Order("created_at desc").Offset(offset).Limit(limit).Find(&posts)

		for _, p := range posts {
			mediaList = append(mediaList, MediaResponse{
				ID:       fmt.Sprintf("post-%d", p.ID),
				URL:      p.ImageURL, // ✅ Corregido
				Type:     "post",
				SourceID: p.ID,
				Username: p.User.Username,
				UserPic:  p.User.Photo,
				Date:     p.CreatedAt.Format("2006-01-02 15:04:05"),
			})
		}
	} else if filter == "chats" {
		var messages []models.Message
		query := database.DB.Model(&models.Message{}).Where("type = 'image' AND content IS NOT NULL AND content != ''")
		query.Count(&total)
		query.Preload("Sender").Order("created_at desc").Offset(offset).Limit(limit).Find(&messages)

		for _, m := range messages {
			mediaList = append(mediaList, MediaResponse{
				ID:       fmt.Sprintf("chat-%d", m.ID),
				URL:      m.Content,
				Type:     "chat",
				SourceID: m.ID,
				Username: m.Sender.Username,
				UserPic:  m.Sender.Photo,
				Date:     m.CreatedAt.Format("2006-01-02 15:04:05"),
			})
		}
	} else if filter == "profiles" {
		var users []models.User
		query := database.DB.Model(&models.User{}).Where("photo IS NOT NULL AND photo != ''")
		query.Count(&total)
		query.Order("created_at desc").Offset(offset).Limit(limit).Find(&users)

		for _, u := range users {
			mediaList = append(mediaList, MediaResponse{
				ID:       fmt.Sprintf("profile-%d", u.ID),
				URL:      u.Photo,
				Type:     "profile",
				SourceID: u.ID,
				Username: u.Username,
				UserPic:  u.Photo,
				Date:     u.CreatedAt.Format("2006-01-02 15:04:05"),
			})
			for i, img := range u.Photos {
				if img != u.Photo {
					mediaList = append(mediaList, MediaResponse{
						ID:       fmt.Sprintf("profile-sec-%d-%d", u.ID, i),
						URL:      img,
						Type:     "profile",
						SourceID: u.ID,
						Username: u.Username,
						UserPic:  u.Photo,
						Date:     u.UpdatedAt.Format("2006-01-02 15:04:05"),
					})
				}
			}
		}
	}

	if mediaList == nil {
		mediaList = []MediaResponse{}
	}

	return c.JSON(fiber.Map{"media": mediaList, "total": total, "page": page, "limit": limit})
}

func DeleteMediaAdmin(c *fiber.Ctx) error {
	mediaType := c.Query("type")
	idStr := c.Query("source_id")
	sourceID, _ := strconv.Atoi(idStr)

	if sourceID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "ID de origen inválido"})
	}

	if mediaType == "post" {
		if err := database.DB.Delete(&models.Post{}, sourceID).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error eliminando publicación"})
		}
	} else if mediaType == "chat" {
		if err := database.DB.Delete(&models.Message{}, sourceID).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error eliminando mensaje de chat"})
		}
	} else if mediaType == "profile" {
		if err := database.DB.Model(&models.User{}).Where("id = ?", sourceID).Updates(map[string]interface{}{
			"photo":  "",
			"photos": models.StringArray{},
		}).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error neutralizando perfil"})
		}
	} else {
		return c.Status(400).JSON(fiber.Map{"error": "Tipo de media desconocido"})
	}

	return c.JSON(fiber.Map{"message": "El archivo multimedia y su contenedor fueron eliminados permanentemente del sistema."})
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
