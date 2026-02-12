package model

import "time"

type Order struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	CarID      int64     `json:"car_id"`
	TotalPrice float64   `json:"total_price"`
	Source     string    `json:"source"` // 'direct' | 'auction'
	CreatedAt  time.Time `json:"created_at"`
}
