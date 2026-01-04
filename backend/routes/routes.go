package routes

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	// Públicas
	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)

	// Privadas
	api.Use(middleware.IsAuthenticated)

	api.Get("/me", controllers.GetMe)
	api.Get("/feed", controllers.GetFeed)
	api.Post("/swipe", controllers.Swipe)

	// --- RUTAS DE CHAT (NUEVAS) ---
	api.Get("/matches", controllers.GetMatches)       // Lista de chats
	api.Get("/messages/:id", controllers.GetMessages) // Historial con usuario X
	api.Post("/messages", controllers.SendMessage)    // Enviar mensaje
	api.Post("/upload", controllers.UploadFile)       // <--- NUEVA

	api.Get("/me", controllers.GetMe)
	api.Put("/me", controllers.UpdateMe) // <--- NUEVA RUTA DE EDICIÓN

	api.Put("/me", controllers.UpdateMe)                    // Actualizar Perfil/Prefs
	api.Put("/change-password", controllers.ChangePassword) // Cambiar Pass
	api.Delete("/me", controllers.DeleteAccount)            // Borrar Cuenta
}
