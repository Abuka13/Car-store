package model

import "time"

type Favorite struct {
	UserID    int64     `json:"user_id"`
	CarID     int64     `json:"car_id"`
	CreatedAt time.Time `json:"created_at"`
}
