package repository

import (
	"database/sql"

	"car-store/internal/model"
)

type BidRepository struct {
	db *sql.DB
}

func NewBidRepository(db *sql.DB) *BidRepository {
	return &BidRepository{db: db}
}

func (r *BidRepository) Create(b *model.Bid) error {
	query := `
		INSERT INTO bids (auction_id, user_id, amount)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	return r.db.QueryRow(
		query,
		b.AuctionID,
		b.UserID,
		b.Amount,
	).Scan(&b.ID, &b.CreatedAt)
}

func (r *BidRepository) GetMaxBidByAuctionID(auctionID int64) (*model.Bid, error) {
	query := `
		SELECT id, auction_id, user_id, amount, created_at
		FROM bids
		WHERE auction_id = $1
		ORDER BY amount DESC
		LIMIT 1
	`

	var b model.Bid
	err := r.db.QueryRow(query, auctionID).Scan(
		&b.ID,
		&b.AuctionID,
		&b.UserID,
		&b.Amount,
		&b.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &b, err
}

func (r *BidRepository) UserBidsLimitInMinute(userID, auctionID int64) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM bids
		WHERE user_id = $1
		  AND auction_id = $2
		  AND created_at >= NOW() - INTERVAL '1 minute'
	`
	var count int
	err := r.db.QueryRow(query, userID, auctionID).Scan(&count)
	return count, err
}

// ДОБАВИТЬ этот метод
func (r *BidRepository) GetByAuctionID(auctionID int64) ([]model.Bid, error) {
	query := `
		SELECT id, auction_id, user_id, amount, created_at
		FROM bids
		WHERE auction_id = $1
		ORDER BY amount DESC
	`

	rows, err := r.db.Query(query, auctionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bids []model.Bid
	for rows.Next() {
		var b model.Bid
		err := rows.Scan(&b.ID, &b.AuctionID, &b.UserID, &b.Amount, &b.CreatedAt)
		if err != nil {
			return nil, err
		}
		bids = append(bids, b)
	}

	return bids, nil
}
