package repository

import (
	"database/sql"

	"car-store/internal/model"
)

type FavoriteRepository struct {
	db *sql.DB
}

func NewFavoriteRepository(db *sql.DB) *FavoriteRepository {
	return &FavoriteRepository{db: db}
}

func (r *FavoriteRepository) Add(userID, carID int64) error {
	_, err := r.db.Exec(`
		INSERT INTO favorites (user_id, car_id)
		VALUES ($1, $2)
	`, userID, carID)
	return err
}

func (r *FavoriteRepository) Remove(userID, carID int64) error {
	_, err := r.db.Exec(`
		DELETE FROM favorites
		WHERE user_id = $1 AND car_id = $2
	`, userID, carID)
	return err
}

func (r *FavoriteRepository) Exists(userID, carID int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM favorites
			WHERE user_id = $1 AND car_id = $2
		)
	`, userID, carID).Scan(&exists)
	return exists, err
}

func (r *FavoriteRepository) GetByUser(userID int64) ([]model.Car, error) {
	rows, err := r.db.Query(`
		SELECT c.id, c.brand, c.model, c.year, c.price,
		       c.status, c.is_auction_only, c.created_at
		FROM cars c
		JOIN favorites f ON f.car_id = c.id
		WHERE f.user_id = $1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cars []model.Car
	for rows.Next() {
		var c model.Car
		if err := rows.Scan(
			&c.ID,
			&c.Brand,
			&c.Model,
			&c.Year,
			&c.Price,
			&c.Status,
			&c.IsAuctionOnly,
			&c.CreatedAt,
		); err != nil {
			return nil, err
		}
		cars = append(cars, c)
	}

	return cars, nil
}
