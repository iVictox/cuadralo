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

	db.AutoMigrate(
		&models.User{},
		&models.Match{},
		&models.Message{},
		&models.Post{},
		&models.PostLike{},
		&models.Comment{},
		&models.CommentLike{},
		&models.Story{},
		&models.Report{},
		&models.Follow{},
	)

	DB = db
}
