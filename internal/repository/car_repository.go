package repository

import (
	"database/sql"

	"car-store/internal/model"
)

type CarRepository struct {
	db *sql.DB
}

func NewCarRepository(db *sql.DB) *CarRepository {
	return &CarRepository{db: db}
}

func (r *CarRepository) Create(car *model.Car) error {
	query := `
		INSERT INTO cars (brand, model, year, price, status, is_auction_only)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`

	return r.db.QueryRow(
		query,
		car.Brand,
		car.Model,
		car.Year,
		car.Price,
		car.Status,
		car.IsAuctionOnly,
	).Scan(&car.ID, &car.CreatedAt)
}

func (r *CarRepository) ExistsByID(id int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(
		"SELECT EXISTS (SELECT 1 FROM cars WHERE id = $1)",
		id,
	).Scan(&exists)

	return exists, err
}
