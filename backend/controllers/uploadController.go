package controllers

import (
	"fmt"
	"os" // <--- IMPORTANTE: Agregado para crear carpetas
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

	// 2. Validar tamaño (Max 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"error": "La imagen es muy pesada (Max 5MB)"})
	}

	// 3. Asegurar que la carpeta 'uploads' exista (CORRECCIÓN CLAVE)
	if _, err := os.Stat("./uploads"); os.IsNotExist(err) {
		os.MkdirAll("./uploads", os.ModePerm)
	}

	// 4. Generar nombre único
	uniqueId := uuid.New()
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uniqueId.String(), filepath.Ext(file.Filename))

	// 5. Guardar en carpeta ./uploads
	savePath := fmt.Sprintf("./uploads/%s", filename)
	if err := c.SaveFile(file, savePath); err != nil {
		fmt.Println("Error guardando archivo:", err) // Log para debug en servidor
		return c.Status(500).JSON(fiber.Map{"error": "Error interno guardando el archivo"})
	}

	// 6. Devolver la URL completa
	// NOTA: Asegúrate que este puerto coincida con tu backend
	fullUrl := fmt.Sprintf("http://localhost:8000/uploads/%s", filename)

	return c.JSON(fiber.Map{
		"url": fullUrl,
	})
}
