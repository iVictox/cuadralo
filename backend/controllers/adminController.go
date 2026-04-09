package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

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
	database.DB.Model(&models.PaymentReport{}).Where("status = ?", "pending").Count(&totalPayments)

	type DailyGrowth struct {
		Date  string `json:"name"`
		Users int64  `json:"users"`
	}
	var growth []DailyGrowth

	database.DB.Raw(`
		SELECT TO_CHAR(DATE_TRUNC('day', created_at), 'Dy') as date, COUNT(*) as users
		FROM users
		WHERE created_at >= NOW() - INTERVAL '7 days'
		GROUP BY DATE_TRUNC('day', created_at)
		ORDER BY DATE_TRUNC('day', created_at) ASC
	`).Scan(&growth)

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

func GetAllUsersAdmin(c *fiber.Ctx) error {
	var users []models.User
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

func UpdateUserRole(c *fiber.Ctx) error {
	userId := c.Params("id")
	var payload struct {
		Role string `json:"role"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	if err := database.DB.Model(&models.User{}).Where("id = ?", userId).Update("role", payload.Role).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar el rol"})
	}
	return c.JSON(fiber.Map{"message": "Rol actualizado con éxito"})
}

func SuspendUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))
	adminRole := c.Locals("userRole").(string)

	var payload struct {
		IsSuspended bool   `json:"is_suspended"`
		Days        int    `json:"days"`
		Reason      string `json:"reason"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var targetUser models.User
	if err := database.DB.First(&targetUser, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if targetUser.Role == "superadmin" && adminRole != "superadmin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "No puedes suspender a un SuperAdministrador."})
	}

	updates := map[string]interface{}{}
	action := "restore_user"
	details := "Suspensión levantada manualmente."

	if payload.IsSuspended {
		updates["is_suspended"] = true
		updates["suspension_reason"] = payload.Reason
		action = "suspend_user"
		details = "Suspendido por: " + payload.Reason

		if payload.Days > 0 {
			expiry := time.Now().AddDate(0, 0, payload.Days)
			updates["suspended_until"] = expiry
			details += " (Hasta " + expiry.Format("02/01/2006") + ")"
		} else {
			updates["suspended_until"] = nil
			details += " (PERMANENTE)"
		}
	} else {
		updates["is_suspended"] = false
		updates["suspended_until"] = nil
		updates["suspension_reason"] = ""
	}

	if err := database.DB.Model(&targetUser).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al aplicar suspensión"})
	}

	LogAdminAction(adminID, action, &targetUser.ID, details)
	return c.JSON(fiber.Map{"message": "Estado de cuenta actualizado correctamente."})
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

	var targetID uint
	idInt, _ := strconv.Atoi(userID)
	targetID = uint(idInt)
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

func RequestAdminRole(c *fiber.Ctx) error {
	userID := uint(c.Locals("userId").(float64))
	var payload struct {
		Role   string `json:"role"`
		Reason string `json:"reason"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if payload.Role != "admin" && payload.Role != "moderator" && payload.Role != "support" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Rol solicitado no es válido"})
	}

	req := models.AdminRequest{
		UserID:        userID,
		RequestedRole: payload.Role,
		Reason:        payload.Reason,
		Status:        "pending",
		CreatedAt:     time.Now(),
	}

	if err := database.DB.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al procesar la solicitud"})
	}

	return c.JSON(fiber.Map{"message": "Solicitud enviada a los SuperAdministradores. Pendiente de aprobación."})
}

func GetAdminRequests(c *fiber.Ctx) error {
	var requests []models.AdminRequest
	if err := database.DB.Preload("User").Where("status = ?", "pending").Order("created_at desc").Find(&requests).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error obteniendo solicitudes"})
	}
	return c.JSON(requests)
}

func ProcessAdminRequest(c *fiber.Ctx) error {
	reqID := c.Params("id")
	superAdminID := uint(c.Locals("userId").(float64))

	var payload struct {
		Action string `json:"action"`
		Reason string `json:"reason"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var req models.AdminRequest
	if err := database.DB.First(&req, reqID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Solicitud no encontrada"})
	}

	if payload.Action == "approve" {
		req.Status = "approved"
		req.ApprovedByID = &superAdminID
		database.DB.Model(&models.User{}).Where("id = ?", req.UserID).Update("role", req.RequestedRole)
		LogAdminAction(superAdminID, "grant_admin_role", &req.UserID, "Rol otorgado: "+req.RequestedRole)
	} else {
		req.Status = "denied"
		req.DeniedReason = payload.Reason
		LogAdminAction(superAdminID, "deny_admin_role", &req.UserID, "Denegado por: "+payload.Reason)
	}

	database.DB.Save(&req)
	return c.JSON(fiber.Map{"message": "Solicitud procesada con éxito"})
}

func GetAdminStaff(c *fiber.Ctx) error {
	var staff []models.User
	roles := []string{"superadmin", "admin", "moderator", "support"}
	if err := database.DB.Where("role IN ?", roles).Select("id, name, username, email, role, is_suspended").Find(&staff).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error obteniendo staff"})
	}
	return c.JSON(staff)
}

func RevokeAdminRole(c *fiber.Ctx) error {
	targetID := c.Params("id")
	superAdminID := uint(c.Locals("userId").(float64))

	var targetUser models.User
	if err := database.DB.First(&targetUser, targetID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if targetUser.Role == "superadmin" {
		var count int64
		database.DB.Model(&models.User{}).Where("role = ?", "superadmin").Count(&count)
		if count <= 1 {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "No puedes degradar al último SuperAdministrador del sistema."})
		}
	}

	database.DB.Model(&targetUser).Update("role", "user")
	LogAdminAction(superAdminID, "revoke_admin_role", &targetUser.ID, "Rol administrativo revocado")

	return c.JSON(fiber.Map{"message": "Privilegios revocados exitosamente"})
}

// ✅ FIX: Preload("User") para obtener todos los datos visuales del usuario que hizo el pago
func GetAllPaymentsAdmin(c *fiber.Ctx) error {
	var payments []models.PaymentReport
	if err := database.DB.Preload("User").Order("created_at desc").Find(&payments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener pagos"})
	}
	return c.JSON(payments)
}

func VerifyPayment(c *fiber.Ctx) error {
	paymentID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var payment models.PaymentReport
	if err := database.DB.First(&payment, paymentID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Pago no encontrado"})
	}

	var payload struct {
		Action   string `json:"action"`
		GrantVIP bool   `json:"grant_vip"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if payload.Action == "verify" {
		payment.Status = "approved"

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
	}

	database.DB.Save(&payment)
	var targetID = payment.ID
	LogAdminAction(adminID, "update_payment_status", &targetID, "Status changed to "+payment.Status)
	return c.JSON(fiber.Map{"message": "Estado de pago actualizado"})
}

func GetAdminLogs(c *fiber.Ctx) error {
	var logs []models.AdminLog
	if err := database.DB.Order("created_at desc").Limit(100).Find(&logs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener registros"})
	}
	return c.JSON(logs)
}

func DeleteUserAdmin(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if user.Role == "superadmin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acción denegada."})
	}

	database.DB.Delete(&user)
	var targetID = user.ID
	LogAdminAction(adminID, "delete_user", &targetID, "User ID "+userID)
	return c.JSON(fiber.Map{"message": "Usuario eliminado"})
}

func GetSystemSettings(c *fiber.Ctx) error {
	var settings []models.Setting
	database.DB.Find(&settings)
	settingsMap := make(map[string]string)
	for _, s := range settings {
		settingsMap[s.Key] = s.Value
	}
	return c.JSON(settingsMap)
}

func UpdateSystemSettings(c *fiber.Ctx) error {
	var payload map[string]interface{}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	adminID := uint(c.Locals("userId").(float64))

	for key, val := range payload {
		strVal := fmt.Sprintf("%v", val)

		var setting models.Setting
		if err := database.DB.First(&setting, "key = ?", key).Error; err != nil {
			setting = models.Setting{Key: key, Value: strVal}
			database.DB.Create(&setting)
		} else {
			setting.Value = strVal
			database.DB.Save(&setting)
		}
	}

	LogAdminAction(adminID, "update_settings", nil, "Configuración del sistema actualizada")
	return c.JSON(fiber.Map{"message": "Configuraciones guardadas y activadas con éxito."})
}
