package controllers

import (
	"fmt"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// UploadFile maneja la recepción de archivos (imágenes para el chat)
func UploadFile(c *fiber.Ctx) error {
	// 1. Leer el archivo del form-data
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No se ha enviado ningún archivo válido",
		})
	}

	// 2. Validar extensión (básico de seguridad)
	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Formato de archivo no permitido. Usa JPG, PNG o WEBP.",
		})
	}

	// 3. Generar un nombre único para evitar colisiones
	// Usamos UUID + timestamp para garantizar unicidad
	uniqueName := fmt.Sprintf("%d-%s%s", time.Now().Unix(), uuid.New().String()[0:8], ext)

	// 4. Definir ruta de destino (asegúrate de que la carpeta ./uploads exista)
	destination := filepath.Join("./uploads", uniqueName)

	// 5. Guardar el archivo en el servidor
	if err := c.SaveFile(file, destination); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al guardar el archivo en el servidor",
		})
	}

	// 6. Construir la URL pública para acceder a la imagen
	// Importante: En producción, esto debería ser la URL de S3/Cloudinary.
	// Para desarrollo local, usamos la ruta estática configurada en main.go
	publicURL := fmt.Sprintf("http://localhost:8000/uploads/%s", uniqueName)

	// 7. Devolver la URL al frontend
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"url":     publicURL,
		"message": "Imagen subida correctamente",
	})
}
