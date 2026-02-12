package model

import "time"

type Car struct {
	ID            int64     `json:"id"`
	Brand         string    `json:"brand"`
	Model         string    `json:"model"`
	Year          int       `json:"year"`
	Price         float64   `json:"price"`
	Status        string    `json:"status"`
	IsAuctionOnly bool      `json:"is_auction_only"`
	CreatedAt     time.Time `json:"created_at"`
}
