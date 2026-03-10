package routes

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	// --- RUTAS PÚBLICAS ---
	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)
	api.Post("/upload", controllers.UploadFile)
	api.Get("/interests", controllers.GetAllInterests)

	// --- MIDDLEWARE DE AUTENTICACIÓN ---
	// Todas las rutas debajo de esto requieren estar logueado
	api.Use(middleware.IsAuthenticated)

	// --- BUSQUEDA & NOTIFICACIONES ---
	api.Get("/search", controllers.SearchUsers)
	api.Get("/notifications", controllers.GetNotifications)
	api.Post("/notifications/:id/read", controllers.MarkNotificationRead)

	// --- SOCIAL (Feed, Posts, Comentarios) ---
	api.Get("/social/feed", controllers.GetSocialFeed)
	api.Post("/social/posts", controllers.CreatePost)
	api.Delete("/social/posts/:id", controllers.DeletePost)
	api.Post("/social/posts/:id/report", controllers.ReportPost)
	api.Post("/social/posts/:id/like", controllers.TogglePostLike)

	api.Get("/social/posts/:id/comments", controllers.GetPostComments)
	api.Post("/social/posts/:id/comments", controllers.CreateComment)
	api.Delete("/social/comments/:id", controllers.DeleteComment)
	api.Post("/social/comments/:id/like", controllers.ToggleCommentLike)

	// --- HISTORIAS ---
	api.Get("/social/stories", controllers.GetActiveStories)
	api.Post("/social/stories", controllers.CreateStory)
	api.Delete("/social/stories/:id", controllers.DeleteStory)
	api.Post("/social/stories/:id/view", controllers.ViewStory)
	api.Get("/social/stories/:id/viewers", controllers.GetStoryViewers)

	// --- PERFILES ---
	api.Get("/u/:username", controllers.GetProfileByUsername)
	api.Post("/users/:id/follow", controllers.FollowUser)
	api.Get("/users/:id", controllers.GetUser)

	// --- USUARIO (Mi cuenta) ---
	api.Get("/me", controllers.GetMe)
	api.Put("/me", controllers.UpdateMe)
	api.Delete("/me", controllers.DeleteAccount)
	api.Put("/change-password", controllers.ChangePassword)

	// --- SWIPE (Citas) ---
	api.Get("/feed", controllers.GetSwipeFeed)
	api.Post("/swipe", controllers.Swipe)
	api.Get("/likes-received", controllers.GetReceivedLikes)
	api.Get("/matches", controllers.GetMatches)
	api.Delete("/matches/:id", controllers.DeleteMatch)

	// --- MENSAJERIA ---
	api.Get("/messages/:id", controllers.GetMessages)
	api.Post("/messages", controllers.SendMessage)
	api.Post("/messages/:id/save", controllers.SaveMessage)
	api.Post("/messages/:id/toggle-save", controllers.ToggleMessageSave)
	api.Delete("/messages/:id", controllers.DeleteMessage)
	api.Post("/messages/:id/view", controllers.MarkMessageViewed)

	// ✅ NUEVAS RUTAS PREMIUM & DESTELLOS
	api.Get("/premium/status", controllers.GetMyPlan) // Ver estado actual (Prime/Boost)
	api.Post("/premium/buy", controllers.BuyPrime)    // Comprar Prime
	api.Post("/premium/boost", controllers.BuyBoost)  // Comprar Destello

	// 🚨 ✅ NUEVO: RUTAS DE ADMINISTRACIÓN
	// Al usar api.Group("/admin"), automáticamente hereda el middleware IsAuthenticated de arriba.
	// Solo necesitamos agregarle el middleware IsAdmin para asegurarnos de que sea administrador.
	admin := api.Group("/admin", middleware.IsAdmin)
	admin.Get("/stats", controllers.GetDashboardStats)
	admin.Get("/users", controllers.GetAllUsersAdmin)
	admin.Put("/users/:id/role", controllers.UpdateUserRole)
}
