package routes

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)
	api.Post("/upload", controllers.UploadFile)

	api.Use(middleware.IsAuthenticated)

	api.Get("/me", controllers.GetMe)
	api.Put("/me", controllers.UpdateMe)
	api.Delete("/me", controllers.DeleteAccount)
	api.Put("/change-password", controllers.ChangePassword)

	api.Get("/feed", controllers.GetFeed)
	api.Post("/swipe", controllers.Swipe)
	api.Get("/likes-received", controllers.GetReceivedLikes)

	api.Post("/purchase", controllers.PurchasePlan)

	api.Get("/matches", controllers.GetMatches)
	api.Delete("/matches/:id", controllers.DeleteMatch)

	api.Get("/users/:id", controllers.GetUser) // <--- RUTA NUEVA IMPRESCINDIBLE

	api.Get("/messages/:id", controllers.GetMessages)
	api.Post("/messages", controllers.SendMessage)

	app.Post("/api/upload", controllers.UploadFile)

	api.Post("/messages/:id/save", controllers.SaveMessage)

	api.Post("/messages/:id/toggle-save", controllers.ToggleMessageSave) // Usamos toggle
	api.Delete("/messages/:id", controllers.DeleteMessage)
	api.Post("/messages/:id/view", controllers.MarkMessageViewed)
}
