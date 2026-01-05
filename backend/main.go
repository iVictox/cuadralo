package main

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/routes"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	database.Connect()

	// AUTOMIGRATE: Agregar las nuevas tablas
	database.DB.AutoMigrate(
		&models.User{},
		&models.Like{},
		&models.Match{},
		&models.Message{},
		&models.Subscription{}, // <--- NUEVA
		&models.Boost{},        // <--- NUEVA
	)

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
	}))

	// Servir carpeta de uploads
	app.Static("/uploads", "./uploads")

	routes.Setup(app)

	log.Fatal(app.Listen(":8000"))
}
