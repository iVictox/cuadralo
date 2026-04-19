package main

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/routes"
	"cuadralo-backend/websockets"
	"log"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// 1. Conectar a Base de Datos
	database.Connect()

	// 2. Ejecutar Migraciones Automáticas
	// Se han eliminado modelos viejos y agregado Transaction
	database.DB.AutoMigrate(
		&models.User{},
		&models.Like{},
		&models.Match{},
		&models.Message{},
		&models.Post{},
		&models.Comment{},
		&models.Story{},
		&models.StoryView{},
		&models.Notification{},
		&models.PostLike{},
		&models.CommentLike{},
		&models.Transaction{}, // ✅ NUEVO: Historial de Pagos
		&models.Report{}, // ✅ Reportes de usuarios, posts y comentarios
	)

	// 3. Iniciar Hub de WebSockets (en segundo plano)
	go websockets.MainHub.Run()

	// 4. Cron Job: Limpieza de mensajes efímeros (cada hora)
	go func() {
		for {
			time.Sleep(1 * time.Hour)

			// Borrar mensajes con > 24h de antigüedad que NO estén guardados
			expirationTime := time.Now().Add(-24 * time.Hour)
			result := database.DB.Where("created_at < ? AND is_saved = ?", expirationTime, false).Delete(&models.Message{})

			if result.RowsAffected > 0 {
				log.Printf("🧹 Limpieza automática: %d mensajes efímeros eliminados.", result.RowsAffected)
			}
		}
	}()

	// 5. Configurar Servidor Fiber
	app := fiber.New(fiber.Config{
		BodyLimit: 15 * 1024 * 1024, // 15 MB
	})

	// Configuración CORS
	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     "http://localhost:3000,https://cuadralo.club", // Ajustar según puerto frontend
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, Upgrade, Connection",
	}))

	// Servir archivos estáticos (imágenes subidas)
	app.Static("/uploads", "./uploads")

	// Middleware para WebSocket Upgrade
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// Ruta WebSocket
	app.Get("/ws/:id", websocket.New(controllers.HandleWebSocket))

	// Configurar Rutas de la API
	routes.Setup(app)

	// Iniciar servidor en puerto 8000
	log.Fatal(app.Listen(":8080"))
}
