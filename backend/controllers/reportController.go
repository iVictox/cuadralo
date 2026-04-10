package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"

	"github.com/gofiber/fiber/v2"
)

// Obtiene los reportes que los usuarios han hecho a los posts
func GetPostReportsAdmin(c *fiber.Ctx) error {
	var reports []models.Report

	// Traer todos los reportes de Posts que sigan pendientes
	if err := database.DB.Preload("Reporter").Preload("Post").Preload("Post.User").
		Where("status = ? AND post_id IS NOT NULL", "pending").
		Order("created_at desc").Find(&reports).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando reportes de la base de datos"})
	}

	return c.JSON(fiber.Map{"reports": reports})
}

// Resuelve la denuncia (Ignorar o Eliminar Publicación)
func ResolveReportAdmin(c *fiber.Ctx) error {
	reportID := c.Params("id")

	var payload struct {
		Action string `json:"action"` // Puede ser "dismiss" (Falsa Alarma) o "delete" (Proceder a purgar)
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Acción inválida"})
	}

	var report models.Report
	if err := database.DB.First(&report, reportID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Denuncia no encontrada en el sistema"})
	}

	if payload.Action == "delete" {
		// El Admin dictó sentencia. Vamos a destruir el Post en cascada.
		if report.PostID != nil {
			postID := *report.PostID

			// 1. Limpiamos dependencias
			database.DB.Where("post_id = ?", postID).Delete(&models.Notification{})
			database.DB.Where("post_id = ?", postID).Delete(&models.PostLike{})
			database.DB.Exec("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE post_id = ?)", postID)
			database.DB.Where("post_id = ? AND parent_id IS NOT NULL", postID).Delete(&models.Comment{})
			database.DB.Where("post_id = ?", postID).Delete(&models.Comment{})

			// 2. Cerramos TODAS las denuncias pendientes asociadas a este mismo post para que no queden flotando
			database.DB.Model(&models.Report{}).Where("post_id = ?", postID).Update("status", "resolved")

			// 3. Borramos el Post Original
			database.DB.Delete(&models.Post{}, postID)
		}
	} else if payload.Action == "dismiss" {
		// Fue una falsa alarma, se marca como ignorado
		report.Status = "dismissed"
		database.DB.Save(&report)
	}

	return c.JSON(fiber.Map{"message": "El reporte ha sido procesado exitosamente."})
}
