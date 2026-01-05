package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

type SwipeInput struct {
	TargetID uint   `json:"target_id"`
	Action   string `json:"action"`
}

func Swipe(c *fiber.Ctx) error {
	myIdFloat := c.Locals("userId").(float64)
	myId := uint(myIdFloat)

	var input SwipeInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	like := models.Like{FromUserID: myId, ToUserID: input.TargetID, Action: input.Action}
	database.DB.Create(&like)

	isMatch := false
	if input.Action == "right" {
		var reverseLike models.Like
		err := database.DB.Where("from_user_id = ? AND to_user_id = ? AND action = 'right'", input.TargetID, myId).First(&reverseLike).Error
		if err == nil {
			isMatch = true
			match := models.Match{User1ID: myId, User2ID: input.TargetID}
			database.DB.Create(&match)
		}
	}
	return c.JSON(fiber.Map{"message": "Swipe registrado", "match": isMatch})
}

// OBTENER LIKES RECIBIDOS (Con lógica de Suscripción Relacional)
func GetReceivedLikes(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	// 1. Verificar si tengo suscripción GOLD o PLATINUM activa
	var activeSub models.Subscription
	err := database.DB.Where("user_id = ? AND status = 'active' AND end_date > ?", myId, time.Now()).
		Where("plan IN ?", []string{"gold", "platinum"}). // Solo Gold y Platinum ven likes
		First(&activeSub).Error

	isGoldOrBetter := (err == nil) // true si encontró suscripción

	// 2. Obtener IDs de likes recibidos
	var likedBy []models.Like
	database.DB.Where("to_user_id = ? AND action = 'right'", myId).Find(&likedBy)
	var likerIDs []uint
	for _, l := range likedBy {
		likerIDs = append(likerIDs, l.FromUserID)
	}

	// 3. Excluir ya respondidos
	var mySwipes []models.Like
	database.DB.Where("from_user_id = ?", myId).Find(&mySwipes)
	swipedMap := make(map[uint]bool)
	for _, s := range mySwipes {
		swipedMap[s.ToUserID] = true
	}

	var pendingIDs []uint
	for _, id := range likerIDs {
		if !swipedMap[id] {
			pendingIDs = append(pendingIDs, id)
		}
	}

	if len(pendingIDs) == 0 {
		return c.JSON([]fiber.Map{})
	}

	// 4. Buscar usuarios
	var users []models.User
	database.DB.Where("id IN ?", pendingIDs).Find(&users)

	// 5. Respuesta (Censurada si no es Gold)
	response := []fiber.Map{}
	for _, u := range users {
		locked := !isGoldOrBetter

		item := fiber.Map{
			"id":     u.ID,
			"age":    u.Age,
			"img":    u.Photo,
			"locked": locked,
		}

		if locked {
			item["name"] = "???"
		} else {
			item["name"] = u.Name
		}
		response = append(response, item)
	}

	return c.JSON(response)
}
