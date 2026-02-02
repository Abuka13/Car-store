package service

import (
	"fmt"
	"log"
	"sync"
	"time"

	"car-store/internal/model"
)

type AuctionRepo interface {
	Create(a *model.Auction) error
	GetAll() ([]model.Auction, error)
	Update(a *model.Auction) error
	Delete(id int64) error
}

type BidRepo interface {
	Create(b *model.Bid) error
	GetMaxBidByAuctionID(auctionID int64) (*model.Bid, error)
}

type AuctionService struct {
	repo    AuctionRepo
	bidRepo BidRepo

	finished map[int64]bool
	mu       sync.Mutex
	stopChan chan struct{} // для корректной остановки
}

func NewAuctionService(repo AuctionRepo, bidRepo BidRepo) *AuctionService {
	return &AuctionService{
		repo:     repo,
		bidRepo:  bidRepo,
		finished: make(map[int64]bool),
		stopChan: make(chan struct{}),
	}
}

// ДОБАВЬТЕ ЭТУ ФУНКЦИЮ - запускает фоновую проверку
func (s *AuctionService) StartAuctionMonitor() {
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		log.Println("Auction monitor started")

		for {
			select {
			case <-ticker.C:
				s.CheckAuctionsEvery5Sec()
			case <-s.stopChan:
				log.Println("Auction monitor stopped")
				return
			}
		}
	}()
}

// Для корректной остановки (опционально)
func (s *AuctionService) Stop() {
	close(s.stopChan)
}

func (s *AuctionService) CreateAuction(a *model.Auction) error {
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

func (s *AuctionService) PlaceBid(auctionID, userID int64, amount float64) error {
	// Проверяем, не закончился ли аукцион
	s.mu.Lock()
	if s.finished[auctionID] {
		s.mu.Unlock()
		return fmt.Errorf("auction has already ended")
	}
	s.mu.Unlock()

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
		if maxBid != nil {
			price = maxBid.Amount
		}

		log.Printf("Auction %d current price: %.2f\n", a.ID, price)

		// финализация
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