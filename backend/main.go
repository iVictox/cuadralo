package main

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/routes"
	"cuadralo-backend/websockets"
	"log"
	"time"

	"github.com/gofiber/contrib/websocket" // Importante: usar contrib/websocket
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	database.Connect()

	// AUTOMIGRATE ACTUALIZADO
	database.DB.AutoMigrate(
		&models.User{},
		&models.Like{},
		&models.Match{},
		&models.Message{},
		&models.Subscription{},
		&models.Boost{},
		&models.Interest{},
	)

	// Iniciar Hub de WebSockets en una goroutine
	go websockets.MainHub.Run()

	// --- CRON JOB: LIMPIEZA DE MENSAJES (24 HORAS) ---
	go func() {
		for {
			time.Sleep(1 * time.Hour) // Ejecutar cada hora

			// Borrar mensajes:
			// 1. Que tengan más de 24h de antigüedad
			// 2. Que NO estén guardados (is_saved = false)
			expirationTime := time.Now().Add(-24 * time.Hour)
			result := database.DB.Where("created_at < ? AND is_saved = ?", expirationTime, false).Delete(&models.Message{})

			if result.RowsAffected > 0 {
				log.Printf("🧹 Limpieza automática: %d mensajes efímeros eliminados.", result.RowsAffected)
			}
		}
	}()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, Upgrade, Connection",
	}))

	app.Static("/uploads", "./uploads")

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// Ruta WebSocket: ws://localhost:8000/ws/:id
	app.Get("/ws/:id", websocket.New(controllers.HandleWebSocket))

	routes.Setup(app)

	log.Fatal(app.Listen(":8000"))
}
