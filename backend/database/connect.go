package database

import (
	"cuadralo-backend/models"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("Nota: No se encontró archivo .env, usando variables de entorno del sistema.")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=admin dbname=cuadralo_db port=5433 sslmode=disable"
	}

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("No se pudo conectar a la base de datos")
	}

	// MIGRACIONES AUTOMÁTICAS
	// Agregamos models.Interest a la lista
	err = database.AutoMigrate(
		&models.User{},
		&models.Like{},
		&models.Match{},
		&models.Subscription{},
		&models.Boost{},
		&models.Message{},
		&models.Interest{}, // <--- NUEVA TABLA
	)
	if err != nil {
		log.Fatal("Error migrando base de datos:", err)
	}

	DB = database
	fmt.Println("Conectado a la Base de Datos exitosamente")

	// --- SEEDING DE INTERESES ---
	seedInterests()
}

func seedInterests() {
	var count int64
	DB.Model(&models.Interest{}).Count(&count)

	if count == 0 {
		fmt.Println("Sembrando intereses iniciales...")
		interests := []models.Interest{
			{Slug: "music", Name: "Música"},
			{Slug: "games", Name: "Gaming"},
			{Slug: "travel", Name: "Viajes"},
			{Slug: "coffee", Name: "Café"},
			{Slug: "gym", Name: "Fitness"},
			{Slug: "movies", Name: "Cine"},
			{Slug: "art", Name: "Arte"},
			{Slug: "books", Name: "Libros"},
			{Slug: "dogs", Name: "Perros"},
			{Slug: "cooking", Name: "Cocina"},
			{Slug: "wine", Name: "Vino"},
			{Slug: "photo", Name: "Fotografía"},
			{Slug: "tech", Name: "Tecnología"},
			{Slug: "crypto", Name: "Crypto"},
			{Slug: "hiking", Name: "Senderismo"},
			{Slug: "health", Name: "Salud"},
			{Slug: "party", Name: "Fiesta"},
			{Slug: "guitar", Name: "Guitarra"},
		}
		DB.Create(&interests)
	}
}
