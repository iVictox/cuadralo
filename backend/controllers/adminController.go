package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

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

	if err := query.Preload("Interests").Order("id desc").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener usuarios"})
	}

	return c.JSON(fiber.Map{
		"users": users,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// ✅ NUEVA FUNCION: Obtener solo usuarios suspendidos
func GetSuspendedUsersAdmin(c *fiber.Ctx) error {
	var users []models.User
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset := (page - 1) * limit
	search := c.Query("search", "")

	query := database.DB.Model(&models.User{}).Where("is_suspended = ?", true)
	if search != "" {
		query = query.Where("(name ILIKE ? OR username ILIKE ? OR id::text = ?)", "%"+search+"%", "%"+search+"%", search)
	}

	var total int64
	query.Count(&total)

	if err := query.Order("suspended_until desc").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener usuarios suspendidos"})
	}

	return c.JSON(fiber.Map{"users": users, "total": total, "page": page, "limit": limit})
}

// ✅ NUEVA FUNCION: Obtener solo usuarios eliminados (En Papelera)
func GetDeletedUsersAdmin(c *fiber.Ctx) error {
	var users []models.User
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset := (page - 1) * limit
	search := c.Query("search", "")

	// Unscoped() permite buscar registros que tienen DeletedAt lleno
	query := database.DB.Unscoped().Model(&models.User{}).Where("deleted_at IS NOT NULL")
	if search != "" {
		query = query.Where("(name ILIKE ? OR username ILIKE ? OR id::text = ?)", "%"+search+"%", "%"+search+"%", search)
	}

	var total int64
	query.Count(&total)

	if err := query.Order("deleted_at desc").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener usuarios eliminados"})
	}

	return c.JSON(fiber.Map{"users": users, "total": total, "page": page, "limit": limit})
}

// ✅ NUEVA FUNCION: Restaurar usuario de la papelera
func RestoreDeletedUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	// Hacemos Update a nil para limpiarlo de la papelera
	if err := database.DB.Unscoped().Model(&models.User{}).Where("id = ?", userID).Update("deleted_at", nil).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo restaurar el usuario"})
	}

	var targetID uint
	idInt, _ := strconv.Atoi(userID)
	targetID = uint(idInt)
	LogAdminAction(adminID, "restore_deleted_user", &targetID, "Usuario restaurado de la papelera")

	return c.JSON(fiber.Map{"message": "Usuario restaurado con éxito."})
}

// ✅ NUEVA FUNCION: Purgar permanentemente de la base de datos (Solo SuperAdmin)
func ForceDeleteUser(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var user models.User
	if err := database.DB.Unscoped().First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if user.Role == "superadmin" {
		return c.Status(403).JSON(fiber.Map{"error": "No puedes purgar a un SuperAdministrador."})
	}

	// Unscoped Delete lo borra FÍSICAMENTE de la base de datos para siempre
	database.DB.Unscoped().Delete(&user)

	var targetID = user.ID
	LogAdminAction(adminID, "force_delete_user", &targetID, "Usuario purgado permanentemente")
	return c.JSON(fiber.Map{"message": "Usuario eliminado de forma permanente."})
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

func GetVipUsersAdmin(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset := (page - 1) * limit
	search := c.Query("search", "")

	query := database.DB.Model(&models.User{}).Where("is_prime = ?", true)

	if search != "" {
		query = query.Where("(name ILIKE ? OR username ILIKE ? OR id::text = ?)", "%"+search+"%", "%"+search+"%", search)
	}

	var total int64
	query.Count(&total)

	var users []models.User
	if err := query.Order("prime_expires_at desc").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener base de datos VIP"})
	}

	type VipResponse struct {
		models.User
		PurchaseDate *time.Time `json:"purchase_date"`
		ApprovalDate *time.Time `json:"approval_date"`
	}

	var response []VipResponse
	for _, u := range users {

		if !u.PrimeExpiresAt.IsZero() && time.Now().After(u.PrimeExpiresAt) {
			database.DB.Model(&u).Update("is_prime", false)
			continue
		}

		vipUser := VipResponse{User: u}

		var payment models.PaymentReport
		if err := database.DB.Where("user_id = ? AND item_type IN ('vip', 'prime') AND status = 'approved'", u.ID).Order("updated_at desc").First(&payment).Error; err == nil {
			vipUser.PurchaseDate = &payment.CreatedAt
			vipUser.ApprovalDate = &payment.UpdatedAt
		} else {
			var sub models.Subscription
			if err := database.DB.Where("user_id = ? AND plan = 'vip'", u.ID).Order("created_at desc").First(&sub).Error; err == nil {
				vipUser.PurchaseDate = &sub.CreatedAt
				vipUser.ApprovalDate = &sub.StartDate
			}
		}
		response = append(response, vipUser)
	}

	return c.JSON(fiber.Map{
		"users": response,
		"total": total,
		"page":  page,
		"limit": limit,
	})
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

	return c.JSON(fiber.Map{"message": "VIP revocado con éxito. El usuario vuelve a ser estándar."})
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
	if !user.IsPrime || user.PrimeExpiresAt.IsZero() || time.Now().After(newExpiry) {
		newExpiry = time.Now()
	}

	newExpiry = newExpiry.AddDate(0, 0, payload.Days)

	isPrime := true
	if time.Now().After(newExpiry) {
		isPrime = false
	}

	if err := database.DB.Model(&user).Updates(map[string]interface{}{
		"is_prime":         isPrime,
		"prime_expires_at": newExpiry,
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo modificar el tiempo VIP"})
	}

	action := "extend_vip"
	if payload.Days < 0 {
		action = "reduce_vip"
	}

	var targetID = user.ID
	LogAdminAction(adminID, action, &targetID, fmt.Sprintf("VIP ajustado en %d días", payload.Days))

	return c.JSON(fiber.Map{"message": "Tiempo modificado con éxito en la base de datos.", "new_expiry": newExpiry, "is_prime": isPrime})
}

func GrantVIPManual(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var payload struct {
		Days int `json:"days"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	newExpiry := time.Now().AddDate(0, 0, payload.Days)

	database.DB.Model(&user).Updates(map[string]interface{}{
		"is_prime":         true,
		"prime_expires_at": newExpiry,
	})

	database.DB.Create(&models.Subscription{
		UserID:    user.ID,
		Plan:      "vip_manual",
		StartDate: time.Now(),
		EndDate:   newExpiry,
		Status:    "active",
		CreatedAt: time.Now(),
	})

	var targetID = user.ID
	LogAdminAction(adminID, "grant_vip_manual", &targetID, fmt.Sprintf("Otorgado manualmente por %d días", payload.Days))

	return c.JSON(fiber.Map{"message": "Membresía VIP otorgada exitosamente al usuario."})
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

// ✅ FIX: Ahora el Delete por defecto es un Soft Delete (Envía a papelera)
func DeleteUserAdmin(c *fiber.Ctx) error {
	userID := c.Params("id")
	adminID := uint(c.Locals("userId").(float64))

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if user.Role == "superadmin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acción denegada. Usa el panel de seguridad."})
	}

	// Al tener el campo DeletedAt en el modelo, esto ejecuta un Soft Delete (Update deleted_at)
	database.DB.Delete(&user)

	var targetID = user.ID
	LogAdminAction(adminID, "delete_user", &targetID, "Usuario enviado a la papelera (Soft Delete)")
	return c.JSON(fiber.Map{"message": "Usuario enviado a la papelera."})
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
