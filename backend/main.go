package main

import (
	"log"
	"os"

	"cuadralo-backend/database"
	"cuadralo-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("Nota: No se encontró archivo .env, usando variables de sistema")
	}

	// 2. Conectar a Base de Datos
	database.Connect()

	// 3. Inicializar App Fiber
	app := fiber.New()

	// 4. Configurar CORS (Vital para que el Frontend se conecte)
	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     "http://localhost:3000, http://localhost:3001", // Puertos típicos de React/Next
		AllowHeaders:     "Origin, Content-Type, Accept",
	}))

	// 5. Configurar Rutas
	routes.Setup(app)

	// 6. Arrancar Servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Fatal(app.Listen(":" + port))
}
