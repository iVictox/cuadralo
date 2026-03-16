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
	Message  string `json:"message"` // ✅ FASE 3: Capturamos el mensaje del frontend
}

func Swipe(c *fiber.Ctx) error {
	myIdFloat := c.Locals("userId").(float64)
	myId := uint(myIdFloat)

	var input SwipeInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var currentUser models.User
	if err := database.DB.First(&currentUser, myId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if currentUser.IsPrime && currentUser.PrimeExpiresAt.Before(time.Now()) {
		currentUser.IsPrime = false
		database.DB.Save(&currentUser)
	}

	// ✅ FASE 3: Lógica de inventario para el Rompehielo
	if input.Action == "rompehielo" {
		if currentUser.RompehielosCount <= 0 {
			return c.Status(403).JSON(fiber.Map{
				"error":          "Sin rompehielos",
				"needs_purchase": true,
				"message":        "Te has quedado sin Rompehielos. Visita la tienda para recargar tu arsenal.",
			})
		}
		// Descontamos 1 rompehielo (consumible)
		currentUser.RompehielosCount--
		database.DB.Save(&currentUser)
	} else if input.Action == "right" {
		// Límite diario para likes normales si no es Prime
		if !currentUser.IsPrime {
			now := time.Now()
			if currentUser.LastLikeDate.Year() != now.Year() || currentUser.LastLikeDate.YearDay() != now.YearDay() {
				currentUser.DailyLikes = 0
			}

			if currentUser.DailyLikes >= 50 {
				return c.Status(403).JSON(fiber.Map{
					"error":       "Límite diario alcanzado",
					"needs_prime": true,
					"message":     "Obtén Cuadralo Prime para deslizar sin límites.",
				})
			}
			currentUser.DailyLikes++
			currentUser.LastLikeDate = now
			database.DB.Save(&currentUser)
		}
	}

	var existing models.Like
	if database.DB.Where("from_user_id = ? AND to_user_id = ?", myId, input.TargetID).First(&existing).RowsAffected > 0 {
		return c.JSON(fiber.Map{"message": "Ya interactuaste con este perfil", "match": false})
	}

	// Guardamos la interacción, incluyendo el mensaje si lo hay
	like := models.Like{
		FromUserID: myId,
		ToUserID:   input.TargetID,
		Action:     input.Action,
		Message:    input.Message,
	}
	database.DB.Create(&like)

	isMatch := false
	// Un rompehielos o un like derecho pueden generar match
	if input.Action == "right" || input.Action == "rompehielo" {
		var reverseLike models.Like
		// Verificamos si la otra persona dio right o rompehielo previamente
		err := database.DB.Where("from_user_id = ? AND to_user_id = ? AND action IN ('right', 'rompehielo')", input.TargetID, myId).First(&reverseLike).Error
		if err == nil {
			isMatch = true
			match := models.Match{User1ID: myId, User2ID: input.TargetID}
			database.DB.Create(&match)
		}
	}
	return c.JSON(fiber.Map{"message": "Interacción registrada", "match": isMatch})
}

// Obtener Feed de Swipe (Candidatos)
func GetSwipeFeed(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	maxDistance := c.QueryInt("distance", 50)

	var currentUser models.User
	if err := database.DB.Select("latitude, longitude").First(&currentUser, myId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario actual no encontrado"})
	}

	var swipedList []models.Like
	database.DB.Select("to_user_id").Where("from_user_id = ?", myId).Find(&swipedList)

	excludedIDs := []uint{myId}
	for _, swipe := range swipedList {
		excludedIDs = append(excludedIDs, swipe.ToUserID)
	}

	var users []models.User
	query := database.DB.Preload("Interests").Where("id NOT IN ?", excludedIDs)

	if currentUser.Latitude != 0 || currentUser.Longitude != 0 {
		haversine := `( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) )`
		query = query.Where(haversine+" <= ?", currentUser.Latitude, currentUser.Longitude, currentUser.Latitude, maxDistance)
	}

	query = query.Order("CASE WHEN is_boosted = true AND boost_expires_at > NOW() THEN 1 ELSE 0 END DESC")

	result := query.Limit(20).Find(&users)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error cargando feed"})
	}

	for i := range users {
		var interestsList []string
		for _, interest := range users[i].Interests {
			interestsList = append(interestsList, interest.Slug)
		}
		users[i].InterestsList = interestsList
	}

	return c.JSON(users)
}

func GetReceivedLikes(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	var currentUser models.User
	database.DB.Select("is_prime, prime_expires_at").First(&currentUser, myId)
	isGoldOrBetter := currentUser.IsPrime && currentUser.PrimeExpiresAt.After(time.Now())

	var likedBy []models.Like
	// Modificado para que aquí NO salgan los rompehielos (esos van en su propia bandeja)
	database.DB.Where("to_user_id = ? AND action = 'right'", myId).Find(&likedBy)

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
	now := time.Now()

	for _, u := range users {
		locked := !isGoldOrBetter

		age := now.Year() - u.BirthDate.Year()
		if now.Month() < u.BirthDate.Month() || (now.Month() == u.BirthDate.Month() && now.Day() < u.BirthDate.Day()) {
			age--
		}

		item := fiber.Map{
			"id":     u.ID,
			"age":    age,
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

func UndoSwipe(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	var currentUser models.User
	if err := database.DB.First(&currentUser, myId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if !currentUser.IsPrime || currentUser.PrimeExpiresAt.Before(time.Now()) {
		return c.Status(403).JSON(fiber.Map{
			"error":       "Acceso denegado",
			"needs_prime": true,
			"message":     "Solo los usuarios Cuadralo Prime pueden rebobinar.",
		})
	}

	var lastLike models.Like
	if err := database.DB.Where("from_user_id = ?", myId).Order("id DESC").First(&lastLike).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No tienes acciones recientes para deshacer."})
	}

	if lastLike.Action == "right" || lastLike.Action == "rompehielo" {
		database.DB.Where("(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
			myId, lastLike.ToUserID, lastLike.ToUserID, myId).Delete(&models.Match{})
	}

	database.DB.Delete(&lastLike)

	return c.JSON(fiber.Map{
		"message": "Perfil rebobinado con éxito. Volverá a aparecer en tu radar.",
	})
}

// ✅ FASE 3: NUEVA FUNCIÓN - Bandeja de entrada de Rompehielos (Destacar del montón)
func GetRompehielosRequests(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	// Buscar likes con acción "rompehielo" dirigidos a mí
	var requests []models.Like
	database.DB.Where("to_user_id = ? AND action = 'rompehielo'", myId).Find(&requests)

	// Filtrar los que yo ya respondí (ya sea ignorados o aceptados)
	var mySwipes []models.Like
	database.DB.Where("from_user_id = ?", myId).Find(&mySwipes)

	swipedMap := make(map[uint]bool)
	for _, s := range mySwipes {
		swipedMap[s.ToUserID] = true
	}

	var pending []fiber.Map
	now := time.Now()

	for _, req := range requests {
		if !swipedMap[req.FromUserID] {
			var sender models.User
			database.DB.Select("id, name, photo, birth_date").First(&sender, req.FromUserID)

			age := now.Year() - sender.BirthDate.Year()
			if now.Month() < sender.BirthDate.Month() || (now.Month() == sender.BirthDate.Month() && now.Day() < sender.BirthDate.Day()) {
				age--
			}

			// A diferencia de los likes normales, los rompehielos nunca se difuminan (siempre ves quién te lo mandó)
			pending = append(pending, fiber.Map{
				"id":      sender.ID,
				"name":    sender.Name,
				"age":     age,
				"img":     sender.Photo,
				"message": req.Message, // El mensaje directo para romper el hielo
			})
		}
	}

	if len(pending) == 0 {
		return c.JSON([]fiber.Map{})
	}

	return c.JSON(pending)
}
