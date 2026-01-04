package routes

import (
	"cuadralo-backend/controllers"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/", controllers.HelloTest)
	api.Post("/register", controllers.Register)
}
