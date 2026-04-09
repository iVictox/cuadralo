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

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
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

	// Migrar el esquema incluyendo los nuevos modelos del Admin
	db.AutoMigrate(
		&models.User{},
		&models.Match{},
		&models.Message{},
		&models.Post{},
		&models.PostLike{},
		&models.Comment{},
		&models.CommentLike{},
		&models.Story{},
		&models.StoryView{},
		&models.Notification{},
		&models.Report{},
		&models.Follow{},
		&models.Interest{},
		&models.Subscription{},
		&models.Boost{},
		&models.Transaction{},
		&models.PaymentReport{},
		&models.AdminLog{},
		&models.Setting{},
		&models.AdminRequest{},    // NUEVO: Flujo de admins
		&models.UserActivityLog{}, // NUEVO: Logs de usuarios
	)

	DB = db

	SeedInterests()
	EnsureSuperAdminExists() // NUEVO: Garantiza acceso de seguridad
}

func EnsureSuperAdminExists() {
	var count int64
	DB.Model(&models.User{}).Where("role = ?", "superadmin").Count(&count)

	if count == 0 {
		fmt.Println("⚠️ ALERTA: No existe ningún SuperAdmin en el sistema. Asegúrate de actualizar el rol del usuario principal a 'superadmin' directamente en la base de datos para acceder al panel de seguridad.")
	}
}

func SeedInterests() {
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
			}
		}
	}
}
