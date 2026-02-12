package model

import "time"

type TradeIn struct {
	ID              int64     `json:"id"`
	UserID          int64     `json:"user_id"`
	OfferedBrand    string    `json:"offered_brand"` // Марка старой машины юзера
	OfferedModel    string    `json:"offered_model"` // Модель старой машины юзера
	Year            int       `json:"year"`
	Mileage         int       `json:"mileage"`
	DesiredCarID    *int64    `json:"desired_car_id,omitempty"`    // ID машины которую хочет купить
	EstimatedPrice  *float64  `json:"estimated_price,omitempty"`   // Оценка админа за старую машину
	Status          string    `json:"status"`                      // pending, evaluated, accepted, rejected
	UserPayment     *float64  `json:"user_payment,omitempty"`      // Сколько юзер готов доплатить
	KolesaSearchURL string    `json:"kolesa_search_url,omitempty"` // Ссылка на kolesa.kz
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type CreateTradeInRequest struct {
	OfferedBrand string `json:"offered_brand" binding:"required"`
	OfferedModel string `json:"offered_model" binding:"required"`
	Year         int    `json:"year" binding:"required,min=1900,max=2025"`
	Mileage      int    `json:"mileage" binding:"required,min=0"`
	DesiredCarID *int64 `json:"desired_car_id"` // ID машины которую хочет (опционально)
}

type EvaluateTradeInRequest struct {
	EstimatedPrice float64 `json:"estimated_price" binding:"required,min=0"`
}

type SetUserPaymentRequest struct {
	UserPayment float64 `json:"user_payment" binding:"required,min=0"` // Сколько готов доплатить
}

type TradeInResponse struct {
	Message         string   `json:"message"`
	TradeIn         *TradeIn `json:"trade_in,omitempty"`
	KolesaSearchURL string   `json:"kolesa_search_url,omitempty"` // Прямая ссылка на поиск
}
