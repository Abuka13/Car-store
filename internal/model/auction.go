package model

import "time"

type Auction struct {
	ID         int64     `json:"id"`
	CarID      int64     `json:"car_id"`
	StartPrice float64   `json:"start_price"`
	StartTime  time.Time `json:"start_time"`
	EndTime    time.Time `json:"end_time"`
	CreatedAt  time.Time `json:"created_at"`
}
