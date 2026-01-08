package routes

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	// ==========================================
	// 1. RUTAS PÚBLICAS (Sin token)
	// ==========================================
	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)
	api.Post("/upload", controllers.UploadFile) // ✅ Correcto: Accesible para registro

	// ==========================================
	// 2. MIDDLEWARE DE SEGURIDAD
	// (Todo lo de abajo requiere Auth)
	// ==========================================
	api.Use(middleware.IsAuthenticated)

	// ==========================================
	// 3. RUTAS PRIVADAS (Con token)
	// ==========================================

	// Usuario
	api.Get("/me", controllers.GetMe)
	api.Put("/me", controllers.UpdateMe)
	api.Delete("/me", controllers.DeleteAccount)
	api.Put("/change-password", controllers.ChangePassword)

	// Feed y Likes
	api.Get("/feed", controllers.GetFeed)
	api.Post("/swipe", controllers.Swipe)
	api.Get("/likes-received", controllers.GetReceivedLikes)

	// Pagos
	api.Post("/purchase", controllers.PurchasePlan)

	// Matches
	api.Get("/matches", controllers.GetMatches)
	api.Delete("/matches/:id", controllers.DeleteMatch)

	// Perfiles ajenos
	api.Get("/users/:id", controllers.GetUser)

	// Mensajería
	api.Get("/messages/:id", controllers.GetMessages)
	api.Post("/messages", controllers.SendMessage)

	// Acciones sobre mensajes
	api.Post("/messages/:id/save", controllers.SaveMessage)
	api.Post("/messages/:id/toggle-save", controllers.ToggleMessageSave)
	api.Delete("/messages/:id", controllers.DeleteMessage)
	api.Post("/messages/:id/view", controllers.MarkMessageViewed)

}
