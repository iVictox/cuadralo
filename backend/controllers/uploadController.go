package controllers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

func UploadFile(c *fiber.Ctx) error {
	// 1. Obtener el archivo del formulario
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No se subió ninguna imagen"})
	}

	// 2. Generar nombre único (ej: 123456789_mifoto.jpg)
	uniqueName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)

	// 3. Guardar en la carpeta ./uploads
	savePath := fmt.Sprintf("./uploads/%s", uniqueName)
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error guardando el archivo"})
	}

	// 4. Devolver la URL pública
	// Nota: En producción cambiarías localhost por tu dominio real
	fullUrl := fmt.Sprintf("http://localhost:8000/uploads/%s", uniqueName)

	return c.JSON(fiber.Map{
		"url": fullUrl,
	})
}
