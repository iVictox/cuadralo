package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetPostReportsAdmin(c *fiber.Ctx) error {
	var reports []models.Report

	if err := database.DB.Preload("Reporter").Preload("Post").Preload("Post.User").
		Where("status = ? AND post_id IS NOT NULL", "pending").
		Order("created_at desc").Find(&reports).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando reportes de la base de datos"})
	}

	return c.JSON(fiber.Map{"reports": reports})
}

// ✅ NUEVA FUNCIÓN: Obtiene las denuncias hechas a los comentarios
func GetCommentReportsAdmin(c *fiber.Ctx) error {
	var reports []models.Report

	if err := database.DB.Preload("Reporter").Preload("Comment").Preload("Comment.User").
		Where("status = ? AND comment_id IS NOT NULL", "pending").
		Order("created_at desc").Find(&reports).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando reportes de comentarios"})
	}

	return c.JSON(fiber.Map{"reports": reports})
}

func GetPostReportsResolved(c *fiber.Ctx) error {
	var reports []models.Report
	if err := database.DB.Preload("Reporter").Preload("Post").Preload("Post.User").
		Where("status IN ('resolved', 'dismissed') AND post_id IS NOT NULL").
		Order("created_at desc").Find(&reports).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando historial"})
	}
	return c.JSON(fiber.Map{"reports": reports})
}

func GetCommentReportsResolved(c *fiber.Ctx) error {
	var reports []models.Report
	if err := database.DB.Preload("Reporter").Preload("Comment").Preload("Comment.User").
		Where("status IN ('resolved', 'dismissed') AND comment_id IS NOT NULL").
		Order("created_at desc").Find(&reports).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando historial"})
	}
	return c.JSON(fiber.Map{"reports": reports})
}

func ResolveReportAdmin(c *fiber.Ctx) error {
	reportID := c.Params("id")

	var payload struct {
		Action string `json:"action"`
		Reason string `json:"reason"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Acción inválida"})
	}

	var report models.Report
	if err := database.DB.First(&report, reportID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Denuncia no encontrada en el sistema"})
	}

	if payload.Action == "delete" {
		if report.PostID != nil {
			postID := *report.PostID

			database.DB.Where("post_id = ?", postID).Delete(&models.Notification{})
			database.DB.Where("post_id = ?", postID).Delete(&models.PostLike{})
			database.DB.Exec("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE post_id = ?)", postID)
			database.DB.Where("post_id = ? AND parent_id IS NOT NULL", postID).Delete(&models.Comment{})
			database.DB.Where("post_id = ?", postID).Delete(&models.Comment{})

			database.DB.Model(&models.Report{}).Where("post_id = ?", postID).Update("status", "resolved")
			database.DB.Delete(&models.Post{}, postID)

		} else if report.CommentID != nil {
			commentID := *report.CommentID

			database.DB.Where("comment_id = ?", commentID).Delete(&models.Report{})
			database.DB.Exec("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE parent_id = ?)", commentID)
			database.DB.Where("parent_id = ?", commentID).Delete(&models.Comment{})
			database.DB.Where("comment_id = ?", commentID).Delete(&models.CommentLike{})

			database.DB.Model(&models.Report{}).Where("comment_id = ?", commentID).Update("status", "resolved")
			database.DB.Delete(&models.Comment{}, commentID)
		}
	} else if payload.Action == "ban" {
		if report.ReportedUserID != nil {
			userID := *report.ReportedUserID

			var user models.User
			if err := database.DB.First(&user, userID).Error; err == nil {
				suspensionReason := "Usuario reportado y baneado por moderator"
				if payload.Reason != "" {
					suspensionReason = payload.Reason
				}
				database.DB.Model(&user).Updates(map[string]interface{}{
					"is_suspended":     true,
					"suspended_until": nil,
					"suspension_reason": suspensionReason,
				})
			}

			database.DB.Model(&models.Report{}).Where("reported_user_id = ?", userID).Update("status", "resolved")
		}
	} else if payload.Action == "dismiss" {
		report.Status = "dismissed"
		database.DB.Save(&report)
	}

	return c.JSON(fiber.Map{"message": "El reporte ha sido procesado exitosamente."})
}
