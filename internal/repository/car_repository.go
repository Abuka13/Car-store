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

func (r *CarRepository) GetAll() ([]model.Car, error) {
	rows, err := r.db.Query(`
		SELECT id, brand, model, year, price, status, is_auction_only, created_at
		FROM cars
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cars []model.Car
	for rows.Next() {
		var c model.Car
		rows.Scan(
			&c.ID,
			&c.Brand,
			&c.Model,
			&c.Year,
			&c.Price,
			&c.Status,
			&c.IsAuctionOnly,
			&c.CreatedAt,
		)
		cars = append(cars, c)
	}
	return cars, nil
}
func (r *CarRepository) GetByID(id int64) (*model.Car, error) {
	var c model.Car
	err := r.db.QueryRow(`
		SELECT id, brand, model, year, price, status, is_auction_only, created_at
		FROM cars WHERE id = $1
	`, id).Scan(
		&c.ID,
		&c.Brand,
		&c.Model,
		&c.Year,
		&c.Price,
		&c.Status,
		&c.IsAuctionOnly,
		&c.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &c, err
}

func (r *CarRepository) Update(c *model.Car) error {
	_, err := r.db.Exec(`
		UPDATE cars
		SET brand=$1, model=$2, year=$3, price=$4, status=$5, is_auction_only=$6
		WHERE id=$7
	`,
		c.Brand,
		c.Model,
		c.Year,
		c.Price,
		c.Status,
		c.IsAuctionOnly,
		c.ID,
	)
	return err
}

func (r *CarRepository) Delete(id int64) error {
	_, err := r.db.Exec(`DELETE FROM cars WHERE id=$1`, id)
	return err
}

func (r *CarRepository) ExistsByID(id int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(
		"SELECT EXISTS (SELECT 1 FROM cars WHERE id = $1)",
		id,
	).Scan(&exists)

	return exists, err
}
