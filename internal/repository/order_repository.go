package repository

import (
	"database/sql"

	"car-store/internal/model"
)

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(o *model.Order) error {
	query := `
		INSERT INTO orders (user_id, car_id, total_price, source)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	return r.db.QueryRow(
		query,
		o.UserID,
		o.CarID,
		o.TotalPrice,
		o.Source,
	).Scan(&o.ID, &o.CreatedAt)
}

func (r *OrderRepository) GetByUser(userID int64) ([]model.Order, error) {
	rows, err := r.db.Query(`
		SELECT id, user_id, car_id, total_price, source, created_at
		FROM orders
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []model.Order
	for rows.Next() {
		var o model.Order
		if err := rows.Scan(
			&o.ID,
			&o.UserID,
			&o.CarID,
			&o.TotalPrice,
			&o.Source,
			&o.CreatedAt,
		); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	return orders, nil
}

func (r *OrderRepository) ExistsByCarID(carID int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM orders WHERE car_id = $1
		)
	`, carID).Scan(&exists)
	return exists, err
}
