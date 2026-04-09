package routes

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {

	// Rutas Públicas Auth
	api := app.Group("/api")
	api.Post("/register", controllers.Register)
	api.Post("/login", controllers.Login)

	// API de Usuario protegida (Para solicitar rol admin)
	userApi := api.Group("/user", middleware.Protected())
	userApi.Post("/admin-request", controllers.RequestAdminRole)

	// ==========================================
	// 🛡️ PANEL ADMINISTRATIVO (Acceso General)
	// ==========================================
	admin := api.Group("/admin", middleware.Protected(), middleware.AdminRequired())

	admin.Get("/stats", controllers.GetDashboardStats)
	admin.Get("/users", controllers.GetAllUsersAdmin)
	admin.Get("/logs", controllers.GetAdminLogs)
	admin.Get("/payments", controllers.GetAllPaymentsAdmin)
	admin.Put("/payments/:id/verify", controllers.VerifyPayment)

	admin.Get("/settings", controllers.GetSystemSettings)

	// Modificación de usuarios
	admin.Put("/users/:id/suspend", controllers.SuspendUser)

	// ==========================================
	// 🔴 PANEL DE ALTO RIESGO (Solo SuperAdmin)
	// ==========================================
	superAdmin := admin.Group("/", middleware.SuperAdminRequired())

	// Gestión de Roles y Settings
	superAdmin.Put("/settings", controllers.UpdateSystemSettings)
	superAdmin.Get("/requests", controllers.GetAdminRequests)
	superAdmin.Put("/requests/:id", controllers.ProcessAdminRequest)
	superAdmin.Get("/staff", controllers.GetAdminStaff)
	superAdmin.Put("/staff/:id/revoke", controllers.RevokeAdminRole)
	superAdmin.Delete("/users/:id", controllers.DeleteUserAdmin)
}
