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
	api.Post("/login/google", controllers.GoogleLogin)
	api.Post("/upload", controllers.UploadFile)
	api.Get("/interests", controllers.GetAllInterests)

	// MIDDLEWARE
	api.Use(middleware.IsAuthenticated)

	api.Get("/search", controllers.SearchUsers)
	api.Get("/notifications", controllers.GetNotifications)
	api.Post("/notifications/read-all", controllers.MarkAllNotificationsRead)
	api.Post("/notifications/:id/read", controllers.MarkNotificationRead)
	api.Delete("/notifications/:id", controllers.DeleteNotification)

	api.Get("/social/feed", controllers.GetSocialFeed)
	api.Post("/social/posts", controllers.CreatePost)
	api.Delete("/social/posts/:id", controllers.DeletePost)
	api.Post("/social/posts/:id/report", controllers.ReportPost)
	api.Post("/social/posts/:id/like", controllers.TogglePostLike)
	api.Get("/social/posts/:id", controllers.GetSinglePost)
	api.Get("/users/:id/posts", controllers.GetUserPosts)

	api.Get("/social/posts/:id/comments", controllers.GetPostComments)
	api.Post("/social/posts/:id/comments", controllers.CreateComment)
	api.Delete("/social/comments/:id", controllers.DeleteComment)
	api.Post("/social/comments/:id/like", controllers.ToggleCommentLike)

	api.Get("/social/stories", controllers.GetActiveStories)
	api.Post("/social/stories", controllers.CreateStory)
	api.Delete("/social/stories/:id", controllers.DeleteStory)
	api.Post("/social/stories/:id/view", controllers.ViewStory)
	api.Get("/social/stories/:id/viewers", controllers.GetStoryViewers)

	api.Get("/u/:username", controllers.GetProfileByUsername)
	api.Post("/users/:id/follow", controllers.FollowUser)
	api.Get("/users/:id", controllers.GetUser)

	api.Get("/me", controllers.GetMe)
	api.Put("/me", controllers.UpdateMe)
	api.Delete("/me", controllers.DeleteAccount)
	api.Put("/change-password", controllers.ChangePassword)

	// --- SWIPE (Citas) ---
	api.Get("/feed", controllers.GetSwipeFeed)
	api.Post("/swipe", controllers.Swipe)
	api.Delete("/swipe/undo", controllers.UndoSwipe)
	api.Get("/likes-received", controllers.GetReceivedLikes)
	api.Get("/rompehielos/requests", controllers.GetRompehielosRequests) // ✅ FASE 3: Bandeja de entrada de Rompehielos
	api.Get("/matches", controllers.GetMatches)
	api.Delete("/matches/:id", controllers.DeleteMatch)

	// --- MENSAJERIA ---
	api.Get("/messages/:id", controllers.GetMessages)
	api.Post("/messages", controllers.SendMessage)
	api.Post("/messages/:id/save", controllers.SaveMessage)
	api.Post("/messages/:id/toggle-save", controllers.ToggleMessageSave)
	api.Delete("/messages/:id", controllers.DeleteMessage)
	api.Post("/messages/:id/view", controllers.MarkMessageViewed)

	// --- PREMIUM Y TIENDA ---
	api.Get("/premium/status", controllers.GetMyPlan)
	api.Get("/premium/rate", controllers.GetExchangeRate)
	api.Post("/premium/buy", controllers.BuyPrime)
	api.Post("/premium/boost/buy", controllers.BuyBoost)
	api.Post("/premium/boost/activate", controllers.ActivateBoost)
	api.Post("/premium/rompehielos/buy", controllers.BuyRompehielos)
	api.Post("/premium/report-payment", controllers.ReportPayment)


	// --- ADMIN ---
	admin := api.Group("/admin", middleware.IsAdmin)
	admin.Get("/stats", controllers.GetDashboardStats)
	admin.Get("/users", controllers.GetAllUsersAdmin)
	admin.Put("/users/:id/role", controllers.UpdateUserRole)
	admin.Put("/users/:id/suspend", controllers.SuspendUser)
	admin.Delete("/users/:id", controllers.DeleteUserAdmin)

	admin.Get("/payments", controllers.GetAllPaymentsAdmin)
	admin.Put("/payments/:id/verify", controllers.VerifyPayment)

	admin.Put("/users/:id/vip/revoke", controllers.RevokeVIP)
	admin.Put("/users/:id/vip/extend", controllers.ExtendVIP)

	admin.Get("/logs", controllers.GetAdminLogs)

	admin.Get("/settings", controllers.GetSystemSettings)
	admin.Put("/settings", controllers.UpdateSystemSettings)

}
