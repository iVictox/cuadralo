package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Devuelve los reportes en un formato enriquecido para el Dashboard
func GetAdminReports(c *fiber.Ctx) error {
	targetType := c.Query("type", "post")

	var reports []models.Report
	query := database.DB.Preload("Reporter").Order("created_at desc")

	if targetType == "resolved" {
		query = query.Where("status != 'pending'")
	} else {
		query = query.Where("status = 'pending' AND target_type = ?", targetType)
	}

	query.Find(&reports)

	var results []map[string]interface{}
	for _, r := range reports {
		item := map[string]interface{}{
			"id":             r.ID,
			"reporter":       r.Reporter.Username,
			"target_type":    r.TargetType,
			"target_id":      r.TargetID,
			"reason":         r.Reason,
			"status":         r.Status,
			"created_at":     r.CreatedAt,
			"resolved_at":    r.ResolvedAt,
			"target_preview": "[Contenido no disponible]",
		}

		// Enriquecimiento dinámico basado en la entidad reportada
		if r.TargetType == "post" {
			var p models.Post
			if database.DB.Preload("User").First(&p, r.TargetID).Error == nil {
				item["target_preview"] = p.Caption
				item["target_image"] = p.ImageURL
				item["target_user"] = p.User.Username
				item["target_user_id"] = p.User.ID
			} else {
				item["target_preview"] = "[Publicación Eliminada por el usuario]"
			}
		} else if r.TargetType == "comment" {
			var com models.Comment
			if database.DB.Preload("User").First(&com, r.TargetID).Error == nil {
				item["target_preview"] = com.Content
				item["target_user"] = com.User.Username
				item["target_user_id"] = com.User.ID
				item["parent_post_id"] = com.PostID
			} else {
				item["target_preview"] = "[Comentario Eliminado por el usuario]"
			}
		} else if r.TargetType == "message" {
			var m models.Message
			if database.DB.Preload("Sender").First(&m, r.TargetID).Error == nil {
				if m.Type == "image" {
					item["target_image"] = m.Content
					item["target_preview"] = "[Imagen de Chat Efímera]"
				} else {
					item["target_preview"] = m.Content
				}
				item["target_user"] = m.Sender.Username
				item["target_user_id"] = m.Sender.ID
			} else {
				item["target_preview"] = "[Mensaje Eliminado]"
			}
		} else if r.TargetType == "user" {
			var u models.User
			if database.DB.First(&u, r.TargetID).Error == nil {
				item["target_preview"] = u.Bio
				item["target_image"] = u.Photo
				item["target_user"] = u.Username
				item["target_user_id"] = u.ID
			} else {
				item["target_preview"] = "[Usuario Eliminado]"
			}
		}
		results = append(results, item)
	}

	return c.JSON(results)
}

// Resuelve el reporte y ejecuta el castigo si es necesario
func ResolveAdminReport(c *fiber.Ctx) error {
	reportID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var payload struct {
		Action     string `json:"action"` // "dismiss", "delete_content"
		AdminNotes string `json:"admin_notes"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var report models.Report
	if err := database.DB.First(&report, reportID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Reporte no encontrado"})
	}

	now := time.Now()
	report.Status = "resolved"
	if payload.Action == "dismiss" {
		report.Status = "dismissed"
	}
	report.ResolvedByID = &adminID
	report.ResolvedAt = &now
	report.AdminNotes = payload.AdminNotes

	// ✅ Ejecución Automática del Castigo
	if payload.Action == "delete_content" {
		if report.TargetType == "post" {
			// Borrado en cascada
			database.DB.Where("post_id = ?", report.TargetID).Delete(&models.Notification{})
			database.DB.Where("post_id = ?", report.TargetID).Delete(&models.PostLike{})
			database.DB.Exec("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE post_id = ?)", report.TargetID)
			database.DB.Where("post_id = ?", report.TargetID).Delete(&models.Comment{})
			database.DB.Delete(&models.Post{}, report.TargetID)
		} else if report.TargetType == "comment" {
			database.DB.Exec("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE parent_id = ?)", report.TargetID)
			database.DB.Where("parent_id = ?", report.TargetID).Delete(&models.Comment{})
			database.DB.Where("comment_id = ?", report.TargetID).Delete(&models.CommentLike{})
			database.DB.Delete(&models.Comment{}, report.TargetID)
		} else if report.TargetType == "message" {
			database.DB.Delete(&models.Message{}, report.TargetID)
		} else if report.TargetType == "user" {
			// Para usuarios, aplicamos una suspensión directa e indefinida
			database.DB.Model(&models.User{}).Where("id = ?", report.TargetID).Updates(map[string]interface{}{
				"is_suspended":      true,
				"suspension_reason": "Cuenta suspendida permanentemente por violar normativas tras ser reportada.",
				"suspended_until":   nil,
			})
		}
	}

	database.DB.Save(&report)
	LogAdminAction(adminID, "resolve_report", &report.ID, "Acción: "+payload.Action)

	return c.JSON(fiber.Map{"message": "Reporte procesado y cerrado con éxito."})
}
