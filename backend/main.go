package main

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/routes"
	"os" // <--- Importante para crear carpetas

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// 1. Asegurar que la carpeta 'uploads' existe
	// Si no existe, la crea con permisos de lectura/escritura (0755)
	if _, err := os.Stat("./uploads"); os.IsNotExist(err) {
		os.MkdirAll("./uploads", 0755)
	}

	// 2. Conectar a Base de Datos
	database.Connect()

	// 3. Migrar Modelos (Incluyendo User, Like, Match, Message)
	database.DB.AutoMigrate(&models.User{}, &models.Like{}, &models.Match{}, &models.Message{})

	// 4. Iniciar App Fiber
	app := fiber.New()

	// Logger para ver peticiones en consola
	app.Use(logger.New())

	// 5. Configurar CORS (Permitir conexión desde Frontend)
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://127.0.0.1:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH",
		AllowCredentials: true,
	}))

	// 6. Servir imágenes estáticas
	// Esto permite entrar a http://localhost:8000/uploads/foto.jpg
	app.Static("/uploads", "./uploads")

	// 7. Configurar Rutas
	routes.Setup(app)

	// 8. Arrancar servidor
	app.Listen(":8000")
}
