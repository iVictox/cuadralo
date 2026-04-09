package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

// ✅ Obtiene las métricas generales y reales para el Dashboard
func GetDashboardStats(c *fiber.Ctx) error {
	var totalUsers int64
	var totalMatches int64
	var totalPosts int64
	var primeUsers int64
	var totalPayments int64

	database.DB.Model(&models.User{}).Count(&totalUsers)
	database.DB.Model(&models.Match{}).Count(&totalMatches)
	database.DB.Model(&models.Post{}).Count(&totalPosts)
	database.DB.Model(&models.User{}).Where("is_prime = ?", true).Count(&primeUsers)
	database.DB.Model(&models.PaymentReport{}).Count(&totalPayments)

	// Datos reales de crecimiento de usuarios en los últimos 7 días
	type DailyGrowth struct {
		Date  string `json:"name"`
		Users int64  `json:"users"`
	}
	var growth []DailyGrowth

	// Consulta SQL nativa para PostgreSQL para agrupar usuarios creados por día
	database.DB.Raw(`
		SELECT TO_CHAR(DATE_TRUNC('day', created_at), 'Dy') as date, COUNT(*) as users
		FROM users
		WHERE created_at >= NOW() - INTERVAL '7 days'
		GROUP BY DATE_TRUNC('day', created_at)
		ORDER BY DATE_TRUNC('day', created_at) ASC
	`).Scan(&growth)

	// Si no hay crecimiento reciente, evitamos que el gráfico explote
	if len(growth) == 0 {
		growth = []DailyGrowth{{Date: "Hoy", Users: 0}}
	}

	return c.JSON(fiber.Map{
		"total_users":    totalUsers,
		"total_matches":  totalMatches,
		"total_posts":    totalPosts,
		"prime_users":    primeUsers,
		"total_payments": totalPayments,
		"user_growth":    growth,
	})
}

// ✅ Obtiene la lista completa de usuarios para la tabla de administración sin omitir datos
func GetAllUsersAdmin(c *fiber.Ctx) error {
	var users []models.User

	// Pagination setup
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset := (page - 1) * limit

	search := c.Query("search", "")

	query := database.DB.Model(&models.User{})

	if search != "" {
		query = query.Where("name ILIKE ? OR username ILIKE ? OR id::text = ?", "%"+search+"%", "%"+search+"%", search)
	}

	var total int64
	query.Count(&total)

	// Preload Interests para enviar toda la data sin restricciones de Select
	if err := query.Preload("Interests").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener usuarios"})
	}

	return c.JSON(fiber.Map{
		"users": users,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// ✅ Permite cambiar el rol a un usuario (Ej. de user a admin) o banearlo
func UpdateUserRole(c *fiber.Ctx) error {
	userId := c.Params("id")

	var payload struct {
		Role string `json:"role"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if payload.Role != "user" && payload.Role != "admin" && payload.Role != "banned" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Rol no válido"})
	}

	if err := database.DB.Model(&models.User{}).Where("id = ?", userId).Update("role", payload.Role).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar el rol"})
	}

	return c.JSON(fiber.Map{"message": "Rol actualizado con éxito"})
}

// LogAdminAction is a helper function to record admin activities
func LogAdminAction(adminID uint, action string, targetID *uint, details string) {
	log := models.AdminLog{
		AdminID:   adminID,
		Action:    action,
		TargetID:  targetID,
		Details:   details,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&log)
}

func GetAllPaymentsAdmin(c *fiber.Ctx) error {
	var payments []models.PaymentReport
	if err := database.DB.Order("created_at desc").Find(&payments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener pagos"})
	}
	return c.JSON(payments)
}

func GetAdminLogs(c *fiber.Ctx) error {
	var logs []models.AdminLog
	if err := database.DB.Preload("Admin").Order("created_at desc").Limit(50).Find(&logs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener registros"})
	}
	return c.JSON(logs)
}

func VerifyPayment(c *fiber.Ctx) error {
	paymentID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var payment models.PaymentReport
	if err := database.DB.First(&payment, paymentID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Pago no encontrado"})
	}

	var payload struct {
		Action   string `json:"action"`    // "verify" or "reject"
		GrantVIP bool   `json:"grant_vip"` // ✅ Añadido para forzar VIP desde el panel
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if payload.Action == "verify" {
		payment.Status = "approved"

		// Si es un producto VIP o el Admin marcó la casilla manualmente
		if payment.ItemType == "vip" || payment.ItemType == "prime" || payload.GrantVIP {
			database.DB.Model(&models.User{}).Where("id = ?", payment.UserID).Updates(map[string]interface{}{
				"is_prime":         true,
				"prime_expires_at": time.Now().AddDate(0, 1, 0),
			})

			database.DB.Create(&models.Subscription{
				UserID:    payment.UserID,
				Plan:      "vip",
				StartDate: time.Now(),
				EndDate:   time.Now().AddDate(0, 1, 0),
				Status:    "active",
				CreatedAt: time.Now(),
			})
		}

	} else if payload.Action == "reject" {
		payment.Status = "rejected"
	} else if payload.Action == "pending" {
		payment.Status = "pending"
	} else {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Acción inválida"})
	}

	if err := database.DB.Save(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al guardar el estado del pago"})
	}

	var targetID = payment.ID
	LogAdminAction(adminID, "update_payment_status", &targetID, "Status changed to "+payment.Status)

	return c.JSON(fiber.Map{"message": "Estado de pago actualizado"})
}

func SuspendUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var payload struct {
		IsSuspended bool `json:"is_suspended"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Update("is_suspended", payload.IsSuspended).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar la suspensión del usuario"})
	}

	var user models.User
	database.DB.First(&user, userID)

	action := "suspend_user"
	if !payload.IsSuspended {
		action = "restore_user"
	}

	var targetID = user.ID
	LogAdminAction(adminID, action, &targetID, "User ID "+userID)

	return c.JSON(fiber.Map{"message": "Estado de usuario actualizado"})
}

func RevokeVIP(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"is_prime":         false,
		"prime_expires_at": time.Now(),
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo revocar VIP"})
	}

	var user models.User
	database.DB.First(&user, userID)
	var targetID = user.ID
	LogAdminAction(adminID, "revoke_vip", &targetID, "User ID "+userID)

	return c.JSON(fiber.Map{"message": "VIP revocado con éxito"})
}

func ExtendVIP(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var payload struct {
		Days int `json:"days"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	newExpiry := user.PrimeExpiresAt
	if time.Now().After(newExpiry) {
		newExpiry = time.Now()
	}
	newExpiry = newExpiry.AddDate(0, 0, payload.Days)

	if err := database.DB.Model(&user).Updates(map[string]interface{}{
		"is_prime":         true,
		"prime_expires_at": newExpiry,
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo extender VIP"})
	}

	var targetID = user.ID
	LogAdminAction(adminID, "extend_vip", &targetID, "Extended by days")

	return c.JSON(fiber.Map{"message": "VIP extendido con éxito", "new_expiry": newExpiry})
}

func DeleteUserAdmin(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	database.DB.Delete(&user) // Soft delete

	var targetID = user.ID
	LogAdminAction(adminID, "delete_user", &targetID, "User ID "+userID)

	return c.JSON(fiber.Map{"message": "Usuario eliminado"})
}

func GetSystemSettings(c *fiber.Ctx) error {
	var settings []models.Setting
	database.DB.Find(&settings)

	// Convert to map for easy JSON serialization
	settingsMap := make(map[string]string)
	for _, s := range settings {
		settingsMap[s.Key] = s.Value
	}

	return c.JSON(settingsMap)
}

func UpdateSystemSettings(c *fiber.Ctx) error {
	var payload map[string]string
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	adminID := uint(c.Locals("userId").(float64))

	for key, val := range payload {
		var setting models.Setting
		// Upsert logic
		if err := database.DB.First(&setting, "key = ?", key).Error; err != nil {
			setting = models.Setting{Key: key, Value: val}
			database.DB.Create(&setting)
		} else {
			setting.Value = val
			database.DB.Save(&setting)
		}
	}

	LogAdminAction(adminID, "update_settings", nil, "System settings updated")

	return c.JSON(fiber.Map{"message": "Configuraciones actualizadas"})
}
