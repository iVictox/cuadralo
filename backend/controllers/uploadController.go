package controllers

import (
	"fmt"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func UploadFile(c *fiber.Ctx) error {
	// 1. Leer el archivo del formulario
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No se subió ninguna imagen"})
	}

	// 2. Validar tamaño (ej: Max 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"error": "La imagen es muy pesada (Max 5MB)"})
	}

	// 3. Generar nombre único (Timestamp + UUID)
	// No usamos el ID del usuario porque en el registro aún no lo tenemos
	uniqueId := uuid.New()
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uniqueId.String(), filepath.Ext(file.Filename))

	// 4. Guardar en carpeta ./uploads
	savePath := fmt.Sprintf("./uploads/%s", filename)
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error guardando el archivo"})
	}

	// 5. Devolver la URL completa
	// Ajusta "http://localhost:8000" si tu dominio cambia
	fullUrl := fmt.Sprintf("http://localhost:8000/uploads/%s", filename)

	return c.JSON(fiber.Map{
		"url": fullUrl,
	})
}
