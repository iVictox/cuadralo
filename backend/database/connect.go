package database

import (
	"fmt"
	"log"
	"os"

	"cuadralo-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	// Obtener variables de entorno manualmente o asegurar que .env cargó
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=America/Caracas",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("❌ No se pudo conectar a la base de datos. \n", err)
	}

	log.Println("✅ Conectado a la Base de Datos PostgreSQL")

	// Migraciones automáticas: Crea las tablas si no existen
	log.Println("⚙️ Ejecutando migraciones...")
	DB.AutoMigrate(&models.User{})
	log.Println("✅ Migraciones completadas")
}
