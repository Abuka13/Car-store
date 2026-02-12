package repository

import (
	"database/sql"

	"car-store/internal/model"
)

type AuctionRepository struct {
	db *sql.DB
}

func NewAuctionRepository(db *sql.DB) *AuctionRepository {
	return &AuctionRepository{db: db}
}

func (r *AuctionRepository) Create(a *model.Auction) error {
	query := `
		INSERT INTO auctions (car_id, start_price, start_time, end_time)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	return r.db.QueryRow(
		query,
		a.CarID,
		a.StartPrice,
		a.StartTime,
		a.EndTime,
	).Scan(&a.ID, &a.CreatedAt)
}

func (r *AuctionRepository) GetAll() ([]model.Auction, error) {
	rows, err := r.db.Query(`
		SELECT 
			a.id, 
			a.car_id, 
			a.start_price, 
			a.start_time, 
			a.end_time, 
			a.created_at,
			COALESCE(MAX(b.amount), a.start_price) as current_price,
			COUNT(b.id) as bid_count
		FROM auctions a
		LEFT JOIN bids b ON b.auction_id = a.id
		GROUP BY a.id, a.car_id, a.start_price, a.start_time, a.end_time, a.created_at
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var auctions []model.Auction
	for rows.Next() {
		var a model.Auction
		if err := rows.Scan(
			&a.ID,
			&a.CarID,
			&a.StartPrice,
			&a.StartTime,
			&a.EndTime,
			&a.CreatedAt,
			&a.CurrentPrice,
			&a.BidCount,
		); err != nil {
			return nil, err
		}
		auctions = append(auctions, a)
	}
	return auctions, nil
}

func (r *AuctionRepository) Update(a *model.Auction) error {
	query := `
		UPDATE auctions
		SET car_id = $1,
		    start_price = $2,
		    start_time = $3,
		    end_time = $4
		WHERE id = $5
	`
	_, err := r.db.Exec(
		query,
		a.CarID,
		a.StartPrice,
		a.StartTime,
		a.EndTime,
		a.ID,
	)
	return err
}

func (r *AuctionRepository) Delete(id int64) error {
	_, err := r.db.Exec(`DELETE FROM auctions WHERE id = $1`, id)
	return err
}

func (r *AuctionRepository) GetByID(id int64) (*model.Auction, error) {
	query := `
		SELECT 
			a.id, 
			a.car_id, 
			a.start_price, 
			a.start_time, 
			a.end_time, 
			a.created_at,
			COALESCE(MAX(b.amount), a.start_price) as current_price,
			COUNT(b.id) as bid_count
		FROM auctions a
		LEFT JOIN bids b ON b.auction_id = a.id
		WHERE a.id = $1
		GROUP BY a.id, a.car_id, a.start_price, a.start_time, a.end_time, a.created_at
	`
	var a model.Auction
	err := r.db.QueryRow(query, id).Scan(
		&a.ID, &a.CarID, &a.StartPrice, &a.StartTime, &a.EndTime, &a.CreatedAt,
		&a.CurrentPrice, &a.BidCount,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *AuctionRepository) ExistsByCarID(carID int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(
		"SELECT EXISTS (SELECT 1 FROM auctions WHERE car_id = $1)",
		carID,
	).Scan(&exists)

	return exists, err
}
