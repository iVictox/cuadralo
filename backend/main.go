package main

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger" // <--- NUEVO: Para ver los logs
)

func main() {
	// 1. Conectar a Base de Datos
	database.Connect()

	// 2. Migrar Modelos
	database.DB.AutoMigrate(&models.User{}, &models.Like{}, &models.Match{})
	// 3. Iniciar App Fiber
	app := fiber.New()

	// 4. Logger (Para ver en la consola cuando alguien se conecta)
	app.Use(logger.New())

	// 5. Configurar CORS (MODO PERMISIVO PARA DESARROLLO)
	// Esto permite que el frontend (localhost:3000) se conecte sin problemas
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://127.0.0.1:3000", // Aceptamos ambas formas
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH",
		AllowCredentials: true,
	}))

	// 6. Configurar Rutas
	routes.Setup(app)

	// 7. Arrancar servidor en puerto 8000
	app.Listen(":8000")
}
