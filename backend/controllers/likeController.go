package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Input para el Swipe
type SwipeInput struct {
	TargetID uint   `json:"target_id"`
	Action   string `json:"action"` // "left" o "right"
}

// 1. Registrar Swipe (Like/Dislike)
func Swipe(c *fiber.Ctx) error {
	myIdFloat := c.Locals("userId").(float64)
	myId := uint(myIdFloat)

	var input SwipeInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Verificar si ya existe el swipe para no duplicar
	var existing models.Like
	if database.DB.Where("from_user_id = ? AND to_user_id = ?", myId, input.TargetID).First(&existing).RowsAffected > 0 {
		return c.JSON(fiber.Map{"message": "Ya interactuaste con este perfil", "match": false})
	}

	like := models.Like{FromUserID: myId, ToUserID: input.TargetID, Action: input.Action}
	database.DB.Create(&like)

	isMatch := false
	if input.Action == "right" {
		var reverseLike models.Like
		// Verificamos si la otra persona también dio like ("right")
		err := database.DB.Where("from_user_id = ? AND to_user_id = ? AND action = 'right'", input.TargetID, myId).First(&reverseLike).Error
		if err == nil {
			isMatch = true
			match := models.Match{User1ID: myId, User2ID: input.TargetID}
			database.DB.Create(&match)
		}
	}
	return c.JSON(fiber.Map{"message": "Swipe registrado", "match": isMatch})
}

// 2. Obtener Feed de Swipe (Candidatos)
func GetSwipeFeed(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	// A. Obtener lista de usuarios a los que YA les hice swipe (likes o dislikes)
	var swipedList []models.Like
	database.DB.Select("to_user_id").Where("from_user_id = ?", myId).Find(&swipedList)

	// Crear mapa de IDs excluidos (incluyéndome a mí mismo)
	excludedIDs := []uint{myId}
	for _, swipe := range swipedList {
		excludedIDs = append(excludedIDs, swipe.ToUserID)
	}

	// B. Buscar usuarios que NO estén en la lista de excluidos
	var users []models.User
	// Preload de intereses para mostrar en la tarjeta
	result := database.DB.Preload("Interests").
		Where("id NOT IN ?", excludedIDs).
		Limit(20). // Traemos de 20 en 20 para no saturar
		Find(&users)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando feed"})
	}

	// C. Formatear respuesta (incluyendo intereses simplificados)
	for i := range users {
		var interestsList []string
		for _, interest := range users[i].Interests {
			interestsList = append(interestsList, interest.Slug)
		}
		users[i].InterestsList = interestsList
	}

	return c.JSON(users)
}

// 3. Obtener Likes Recibidos (Pantalla "Le gustas")
func GetReceivedLikes(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	// Verificar suscripción
	var activeSub models.Subscription
	err := database.DB.Where("user_id = ? AND status = 'active' AND end_date > ?", myId, time.Now()).
		Where("plan IN ?", []string{"gold", "platinum"}).
		First(&activeSub).Error

	isGoldOrBetter := (err == nil)

	// Obtener quienes me dieron like
	var likedBy []models.Like
	database.DB.Where("to_user_id = ? AND action = 'right'", myId).Find(&likedBy)

	// Filtrar los que yo ya respondí (match o rechazo)
	var mySwipes []models.Like
	database.DB.Where("from_user_id = ?", myId).Find(&mySwipes)

	swipedMap := make(map[uint]bool)
	for _, s := range mySwipes {
		swipedMap[s.ToUserID] = true
	}

	var pendingIDs []uint
	for _, l := range likedBy {
		if !swipedMap[l.FromUserID] {
			pendingIDs = append(pendingIDs, l.FromUserID)
		}
	}

	if len(pendingIDs) == 0 {
		return c.JSON([]fiber.Map{})
	}

	var users []models.User
	database.DB.Where("id IN ?", pendingIDs).Find(&users)

	response := []fiber.Map{}
	now := time.Now() // Fecha actual para calcular la edad

	for _, u := range users {
		locked := !isGoldOrBetter

		// ✅ CORRECCIÓN: Calcular la edad dinámicamente basada en BirthDate
		age := now.Year() - u.BirthDate.Year()
		if now.Month() < u.BirthDate.Month() || (now.Month() == u.BirthDate.Month() && now.Day() < u.BirthDate.Day()) {
			age--
		}

		item := fiber.Map{
			"id":     u.ID,
			"age":    age, // Usamos la edad calculada
			"img":    u.Photo,
			"locked": locked,
			"name":   u.Name,
		}
		if locked {
			item["name"] = "???"
		}
		response = append(response, item)
	}

	return c.JSON(response)
}
