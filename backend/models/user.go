package models

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	Username  string `gorm:"uniqueIndex" json:"username"`
	Email     string `gorm:"unique" json:"email"`
	Password  string `json:"-"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	BirthDate string `json:"birth_date"`

	// FOTO PRINCIPAL (Avatar clásico)
	Photo string `json:"photo"`

	// ✅ GALERÍA DE PERFIL (Hasta 9 fotos)
	// GORM guardará esto como un JSON text en la base de datos automáticamente
	Photos []string `gorm:"serializer:json" json:"photos"`

	Bio string `json:"bio"`

	// RELACIÓN MANY-TO-MANY
	Interests []Interest `gorm:"many2many:user_interests;" json:"interests_obj"`
	// Campo virtual para devolver solo nombres/slugs
	InterestsList []string `gorm:"-" json:"interests"`

	Preferences string `json:"preferences"`

	// Relaciones
	Likes         []Like         `gorm:"foreignKey:FromUserID"`
	Matches       []Match        `gorm:"foreignKey:User1ID"`
	Subscriptions []Subscription `gorm:"foreignKey:UserID"`
	Boosts        []Boost        `gorm:"foreignKey:UserID"`

	CreatedAt time.Time `json:"created_at"`

	// Campos Virtuales (Estadísticas)
	HasStory    bool  `gorm:"-" json:"has_story"`
	Followers   int64 `gorm:"-" json:"followers_count"`
	Following   int64 `gorm:"-" json:"following_count"`
	IsFollowing bool  `gorm:"-" json:"is_following"`
}

type Follow struct {
	FollowerID  uint      `gorm:"primaryKey" json:"follower_id"`
	FollowingID uint      `gorm:"primaryKey" json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`
}
