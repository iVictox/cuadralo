package database

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	// Cargar variables de entorno del archivo .env
	if err := godotenv.Load(); err != nil {
		log.Println("Nota: No se encontró el archivo .env, usando variables del sistema.")
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		// Configuración por defecto si no hay .env (Ajusta esto a tus datos locales si quieres)
		dsn = "host=localhost user=postgres password=admin dbname=cuadralo_db port=5433 sslmode=disable"
	}

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // Veremos las consultas SQL en la consola
	})

	if err != nil {
		panic("❌ No se pudo conectar a la base de datos")
	}

	fmt.Println("✅ Conexión exitosa a la Base de Datos")
	DB = database
}
