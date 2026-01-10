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
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=America/Caracas",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("No se pudo conectar a la base de datos")
	}

	// Migrar el esquema
	// ✅ IMPORTANTE: Agregamos StoryView y Notification aquí para que se creen las tablas
	db.AutoMigrate(
		&models.User{},
		&models.Match{},
		&models.Message{},
		&models.Post{},
		&models.PostLike{},
		&models.Comment{},
		&models.CommentLike{},
		&models.Story{},
		&models.StoryView{},    // <-- FALTABA ESTO (Soluciona el error 42P01)
		&models.Notification{}, // <-- FALTABA ESTO (Para notificaciones de likes/comments)
		&models.Report{},
		&models.Follow{},
		&models.Interest{},
	)

	DB = db

	// Ejecutar el semillero de intereses
	SeedInterests()
}

// Función para poblar la base de datos con intereses organizados
func SeedInterests() {
	// Mapa de Categoría -> Lista de Intereses
	data := map[string][]string{
		"Deportes":       {"Fútbol", "Gym", "Baloncesto", "Tenis", "Natación", "Ciclismo", "Yoga", "Running", "Crossfit"},
		"Creatividad":    {"Arte", "Diseño", "Fotografía", "Escritura", "Música", "Baile", "Moda", "Maquillaje", "Arquitectura"},
		"Tecnología":     {"Programación", "Gaming", "IA", "Cripto", "Startups", "Diseño Web", "Robótica", "Gadgets"},
		"Estilo de Vida": {"Viajes", "Cocina", "Café", "Vino", "Jardinería", "Minimalismo", "Tatuajes", "Astrología"},
		"Social":         {"Fiesta", "Voluntariado", "Política", "Debate", "Idiomas", "Juegos de Mesa", "Cine", "Series"},
		"Naturaleza":     {"Senderismo", "Camping", "Playa", "Animales", "Ecología", "Surf", "Pesca"},
	}

	for category, interests := range data {
		for _, name := range interests {
			// Crear Slug (usamos el nombre por ahora)
			slug := name

			var count int64
			DB.Model(&models.Interest{}).Where("name = ?", name).Count(&count)

			if count == 0 {
				interest := models.Interest{
					Name:     name,
					Slug:     slug,
					Category: category,
				}
				DB.Create(&interest)
				fmt.Printf("🌱 Interés creado: %s (%s)\n", name, category)
			}
		}
	}
}
