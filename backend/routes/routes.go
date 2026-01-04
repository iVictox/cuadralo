package routes

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	// --- RUTAS PÚBLICAS (No requieren token) ---
	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)

	// Ruta de prueba
	api.Get("/hello", func(c *fiber.Ctx) error {
		return c.SendString("¡Backend Funcionando!")
	})

	// --- RUTAS PRIVADAS (Requieren Login) ---
	// Todo lo que esté debajo de esta línea pasará por el Middleware de Auth
	api.Use(middleware.IsAuthenticated)

	api.Get("/me", controllers.GetMe)     // Obtener mi perfil
	api.Get("/feed", controllers.GetFeed) // Obtener lista de usuarios para swipe
	api.Post("/swipe", controllers.Swipe)
}
