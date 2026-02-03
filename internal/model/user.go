package model

type User struct {
	ID           int64  `json:"id"`
	Email        string `json:"email"`
	Password     string `json:"password,omitempty"` // ТОЛЬКО из запроса
	PasswordHash string `json:"-"`                  // В БД
	Role         string `json:"role"`
}
