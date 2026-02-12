package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"car-store/internal/model"
)

type TradeInRepository interface {
	Create(ctx context.Context, tradeIn *model.TradeIn) error
	GetByID(ctx context.Context, id int64) (*model.TradeIn, error)
	GetByUserID(ctx context.Context, userID int64) ([]model.TradeIn, error)
	GetAll(ctx context.Context, status string) ([]model.TradeIn, error)
	UpdateStatus(ctx context.Context, id int64, status string) error
	Evaluate(ctx context.Context, id int64, estimatedPrice float64) error
	SetUserPayment(ctx context.Context, id int64, userPayment float64, kolesaURL string) error
	Delete(ctx context.Context, id int64) error
}

type tradeInRepository struct {
	db *sql.DB
}

func NewTradeInRepository(db *sql.DB) TradeInRepository {
	return &tradeInRepository{db: db}
}

func (r *tradeInRepository) Create(ctx context.Context, tradeIn *model.TradeIn) error {
	query := `
		INSERT INTO tradeins (user_id, offered_brand, offered_model, year, mileage, desired_car_id, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at
	`

	now := time.Now()
	tradeIn.Status = "pending"
	tradeIn.CreatedAt = now

	err := r.db.QueryRowContext(
		ctx,
		query,
		tradeIn.UserID,
		tradeIn.OfferedBrand,
		tradeIn.OfferedModel,
		tradeIn.Year,
		tradeIn.Mileage,
		tradeIn.DesiredCarID,
		tradeIn.Status,
		tradeIn.CreatedAt,
	).Scan(&tradeIn.ID, &tradeIn.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create trade-in: %w", err)
	}

	return nil
}

func (r *tradeInRepository) GetByID(ctx context.Context, id int64) (*model.TradeIn, error) {
	query := `
		SELECT id, user_id, offered_brand, offered_model, year, mileage, 
		       desired_car_id, estimated_price, status, created_at
		FROM tradeins
		WHERE id = $1
	`

	tradeIn := &model.TradeIn{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&tradeIn.ID,
		&tradeIn.UserID,
		&tradeIn.OfferedBrand,
		&tradeIn.OfferedModel,
		&tradeIn.Year,
		&tradeIn.Mileage,
		&tradeIn.DesiredCarID,
		&tradeIn.EstimatedPrice,
		&tradeIn.Status,
		&tradeIn.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("trade-in not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get trade-in: %w", err)
	}

	return tradeIn, nil
}

func (r *tradeInRepository) GetByUserID(ctx context.Context, userID int64) ([]model.TradeIn, error) {
	query := `
		SELECT id, user_id, offered_brand, offered_model, year, mileage, 
		       desired_car_id, estimated_price, status, created_at
		FROM tradeins
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user trade-ins: %w", err)
	}
	defer rows.Close()

	var tradeIns []model.TradeIn
	for rows.Next() {
		var t model.TradeIn
		err := rows.Scan(
			&t.ID,
			&t.UserID,
			&t.OfferedBrand,
			&t.OfferedModel,
			&t.Year,
			&t.Mileage,
			&t.DesiredCarID,
			&t.EstimatedPrice,
			&t.Status,
			&t.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trade-in: %w", err)
		}
		tradeIns = append(tradeIns, t)
	}

	return tradeIns, nil
}

func (r *tradeInRepository) GetAll(ctx context.Context, status string) ([]model.TradeIn, error) {
	query := `
		SELECT id, user_id, offered_brand, offered_model, year, mileage, 
		       desired_car_id, estimated_price, status, created_at
		FROM tradeins
	`

	args := []interface{}{}
	if status != "" {
		query += " WHERE status = $1"
		args = append(args, status)
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get all trade-ins: %w", err)
	}
	defer rows.Close()

	var tradeIns []model.TradeIn
	for rows.Next() {
		var t model.TradeIn
		err := rows.Scan(
			&t.ID,
			&t.UserID,
			&t.OfferedBrand,
			&t.OfferedModel,
			&t.Year,
			&t.Mileage,
			&t.DesiredCarID,
			&t.EstimatedPrice,
			&t.Status,
			&t.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trade-in: %w", err)
		}
		tradeIns = append(tradeIns, t)
	}

	return tradeIns, nil
}

func (r *tradeInRepository) UpdateStatus(ctx context.Context, id int64, status string) error {
	query := `
		UPDATE tradeins
		SET status = $1
		WHERE id = $2
	`

	result, err := r.db.ExecContext(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("failed to update trade-in status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("trade-in not found")
	}

	return nil
}

func (r *tradeInRepository) Evaluate(ctx context.Context, id int64, estimatedPrice float64) error {
	query := `
		UPDATE tradeins
		SET estimated_price = $1, status = 'evaluated'
		WHERE id = $2
	`

	result, err := r.db.ExecContext(ctx, query, estimatedPrice, id)
	if err != nil {
		return fmt.Errorf("failed to evaluate trade-in: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("trade-in not found")
	}

	return nil
}

// SetUserPayment - юзер указывает сколько готов доплатить, генерируется ссылка на kolesa.kz
func (r *tradeInRepository) SetUserPayment(ctx context.Context, id int64, userPayment float64, kolesaURL string) error {
	query := `
		UPDATE tradeins
		SET status = 'accepted'
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to set user payment: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("trade-in not found")
	}

	return nil
}

func (r *tradeInRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM tradeins WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete trade-in: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("trade-in not found")
	}

	return nil
}
