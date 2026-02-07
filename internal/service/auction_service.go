package service

import (
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	"car-store/internal/model"
)

var ErrAuctionFinished = errors.New("auction is finished")

var (
	ErrCarAlreadyOnAuction = errors.New("car already on auction")
	ErrCarNotFound         = errors.New("car not found")
)

type AuctionRepo interface {
	Create(a *model.Auction) error
	GetAll() ([]model.Auction, error)
	Update(a *model.Auction) error
	Delete(id int64) error
	GetByID(id int64) (*model.Auction, error)
	ExistsByCarID(carID int64) (bool, error)
}

type CarRepo interface {
	ExistsByID(id int64) (bool, error)
}

type BidRepo interface {
	Create(b *model.Bid) error
	GetMaxBidByAuctionID(auctionID int64) (*model.Bid, error)
	UserBidsLimitInMinute(userID, auctionID int64) (int, error)
}

type AuctionService struct {
	repo    AuctionRepo
	carRepo CarRepo
	bidRepo BidRepo

	finished map[int64]bool
	mu       sync.Mutex
}

func NewAuctionService(
	repo AuctionRepo,
	carRepo CarRepo,
	bidRepo BidRepo,
) *AuctionService {
	return &AuctionService{
		repo:     repo,
		carRepo:  carRepo,
		bidRepo:  bidRepo,
		finished: make(map[int64]bool),
	}
}

func (s *AuctionService) CreateAuction(a *model.Auction) error {

	exists, err := s.carRepo.ExistsByID(a.CarID)
	if err != nil {
		return err
	}
	if !exists {
		return ErrCarNotFound
	}

	used, err := s.repo.ExistsByCarID(a.CarID)
	if err != nil {
		return err
	}
	if used {
		return ErrCarAlreadyOnAuction
	}

	return s.repo.Create(a)
}

func (s *AuctionService) GetAuctions() ([]model.Auction, error) {
	return s.repo.GetAll()
}

func (s *AuctionService) UpdateAuction(a *model.Auction) error {
	return s.repo.Update(a)
}

func (s *AuctionService) DeleteAuction(id int64) error {
	return s.repo.Delete(id)
}
func (s *AuctionService) GetAuctionByID(id int64) (*model.Auction, error) {
	return s.repo.GetByID(id)
}

func (s *AuctionService) PlaceBid(auctionID, userID int64, amount float64) error {

	auction, err := s.repo.GetByID(auctionID)
	if err != nil {
		return err
	}
	if auction == nil {
		return errors.New("auction not found")
	}

	if time.Now().After(auction.EndTime) {
		return ErrAuctionFinished
	}

	count, err := s.bidRepo.UserBidsLimitInMinute(userID, auctionID)
	if err != nil {
		return err
	}
	if count >= 3 {
		return fmt.Errorf("bid limit exceeded: max 3 bids per minute")
	}

	maxBid, err := s.bidRepo.GetMaxBidByAuctionID(auctionID)
	if err != nil {
		return err
	}

	currentPrice := 0.0
	if maxBid != nil {
		currentPrice = maxBid.Amount
	}

	if amount <= currentPrice {
		return fmt.Errorf("bid must be higher than current price")
	}

	bid := &model.Bid{
		AuctionID: auctionID,
		UserID:    userID,
		Amount:    amount,
	}

	return s.bidRepo.Create(bid)
}

func (s *AuctionService) CheckAuctionsEvery5Sec() {
	auctions, err := s.repo.GetAll()
	if err != nil {
		log.Println("error getting auctions:", err)
		return
	}

	now := time.Now()

	for _, a := range auctions {
		s.mu.Lock()
		if s.finished[a.ID] {
			s.mu.Unlock()
			continue
		}
		s.mu.Unlock()

		maxBid, _ := s.bidRepo.GetMaxBidByAuctionID(a.ID)
		price := a.StartPrice
		if maxBid != nil && maxBid.Amount > price {
			price = maxBid.Amount
		}

		log.Printf("Auction %d current price: %.2f\n", a.ID, price)

		if a.EndTime.Before(now) {
			s.finalizeOnce(a)
		}
	}
}

func (s *AuctionService) finalizeOnce(a model.Auction) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.finished[a.ID] {
		return
	}

	maxBid, err := s.bidRepo.GetMaxBidByAuctionID(a.ID)
	if err != nil {
		log.Println("error getting max bid:", err)
		return
	}

	if maxBid != nil {
		log.Printf(
			"Auction %d FINISHED. Winner: user %d, price %.2f\n",
			a.ID,
			maxBid.UserID,
			maxBid.Amount,
		)
	} else {
		log.Printf("Auction %d FINISHED with no bids\n", a.ID)
	}

	s.finished[a.ID] = true
}
