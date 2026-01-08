package routes

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	// ==========================================
	// 1. RUTAS PÚBLICAS
	// ==========================================
	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)
	api.Post("/upload", controllers.UploadFile)

	// ==========================================
	// 2. MIDDLEWARE DE SEGURIDAD
	// ==========================================
	api.Use(middleware.IsAuthenticated)

	// ==========================================
	// 3. RUTAS PRIVADAS
	// ==========================================

	// --- SOCIAL NETWORK ---
	api.Get("/social/feed", controllers.GetSocialFeed)
	api.Post("/social/posts", controllers.CreatePost)

	api.Post("/social/posts/:id/like", controllers.TogglePostLike)
	api.Delete("/social/posts/:id", controllers.DeletePost)      // <--- NUEVO: Eliminar Post
	api.Post("/social/posts/:id/report", controllers.ReportPost) // <--- NUEVO: Reportar Post

	// Comentarios
	api.Get("/social/posts/:id/comments", controllers.GetPostComments)
	api.Post("/social/posts/:id/comments", controllers.CreateComment)
	api.Delete("/social/comments/:id", controllers.DeleteComment)
	api.Post("/social/comments/:id/like", controllers.ToggleCommentLike) // <--- NUEVA RUTA

	// Historias
	api.Get("/social/stories", controllers.GetActiveStories)
	api.Post("/social/stories", controllers.CreateStory)
	api.Delete("/social/stories/:id", controllers.DeleteStory) // <--- NUEVA RUTA

	// --- RESTO DE RUTAS ---
	// --- PERFILES Y SEGUIDORES ---
	api.Get("/u/:username", controllers.GetProfileByUsername) // Perfil Público
	api.Post("/users/:id/follow", controllers.ToggleFollow)   // Acción Seguir

	// Usuario
	api.Get("/me", controllers.GetMe)
	api.Put("/me", controllers.UpdateMe)
	api.Delete("/me", controllers.DeleteAccount)
	api.Put("/change-password", controllers.ChangePassword)

	// Swipe (Si usas userController para esto)
	api.Get("/feed", controllers.GetFeed) // OJO: Asegúrate que userController.go tenga su GetFeed o borra esto si ya no usas swipe
	api.Post("/swipe", controllers.Swipe)
	api.Get("/likes-received", controllers.GetReceivedLikes)

	// Pagos
	api.Post("/purchase", controllers.PurchasePlan)

	// Matches
	api.Get("/matches", controllers.GetMatches)
	api.Delete("/matches/:id", controllers.DeleteMatch)

	// Perfiles
	api.Get("/users/:id", controllers.GetUser)

	// Mensajería
	api.Get("/messages/:id", controllers.GetMessages)
	api.Post("/messages", controllers.SendMessage)

	api.Post("/messages/:id/save", controllers.SaveMessage)
	api.Post("/messages/:id/toggle-save", controllers.ToggleMessageSave)
	api.Delete("/messages/:id", controllers.DeleteMessage)
	api.Post("/messages/:id/view", controllers.MarkMessageViewed)
}
