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

// ---------- REPO INTERFACES ----------

type AuctionRepo interface {
	Create(a *model.Auction) error
	GetAll() ([]model.Auction, error)
	Update(a *model.Auction) error
	Delete(id int64) error
	GetByID(id int64) (*model.Auction, error)
	ExistsByCarID(carID int64) (bool, error)
}

type CarExistenceRepo interface {
	ExistsByID(id int64) (bool, error)
}

type BidRepo interface {
	Create(b *model.Bid) error
	GetMaxBidByAuctionID(auctionID int64) (*model.Bid, error)
	UserBidsLimitInMinute(userID, auctionID int64) (int, error)
}

type OrderCreator interface {
	CreateFromAuction(userID, carID int64, price float64) error
}

// ---------- SERVICE ----------

type AuctionService struct {
	repo     AuctionRepo
	carRepo  CarExistenceRepo
	bidRepo  BidRepo
	orderSvc OrderCreator

	finished map[int64]bool
	mu       sync.Mutex
}

func NewAuctionService(
	repo AuctionRepo,
	carRepo CarExistenceRepo,
	bidRepo BidRepo,
	orderSvc OrderCreator,
) *AuctionService {
	return &AuctionService{
		repo:     repo,
		carRepo:  carRepo,
		bidRepo:  bidRepo,
		orderSvc: orderSvc,
		finished: make(map[int64]bool),
	}
}

// ---------- CRUD AUCTIONS ----------

func (s *AuctionService) CreateAuction(a *model.Auction) error {
	// проверяем, что машина существует
	exists, err := s.carRepo.ExistsByID(a.CarID)
	if err != nil {
		return err
	}
	if !exists {
		return ErrCarNotFound
	}

	// проверяем, что машина ещё не участвует в другом аукционе
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

func (s *AuctionService) GetAuctionByID(id int64) (*model.Auction, error) {
	return s.repo.GetByID(id)
}

func (s *AuctionService) UpdateAuction(a *model.Auction) error {
	return s.repo.Update(a)
}

func (s *AuctionService) DeleteAuction(id int64) error {
	return s.repo.Delete(id)
}

// ---------- BIDS ----------

func (s *AuctionService) PlaceBid(auctionID, userID int64, amount float64) error {
	auction, err := s.repo.GetByID(auctionID)
	if err != nil {
		return err
	}
	if auction == nil {
		return errors.New("auction not found")
	}

	// нельзя ставить после окончания
	if time.Now().After(auction.EndTime) {
		return ErrAuctionFinished
	}

	// лимит 3 ставки в минуту
	count, err := s.bidRepo.UserBidsLimitInMinute(userID, auctionID)
	if err != nil {
		return err
	}
	if count >= 3 {
		return fmt.Errorf("bid limit exceeded: max 3 bids per minute")
	}

	// проверяем текущую цену
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

// ---------- BACKGROUND CHECKER ----------

func (s *AuctionService) CheckAuctionsEvery5Sec() {
	auctions, err := s.repo.GetAll()
	if err != nil {
		log.Println("error getting auctions:", err)
		return
	}

	now := time.Now()

	for _, a := range auctions {
		// быстро проверяем, что аукцион уже финализирован
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

		// если ещё идёт — просто показываем текущую цену
		if a.EndTime.After(now) {
			log.Printf("Auction %d current price: %.2f\n", a.ID, price)
		} else {
			// если закончился — финализируем
			s.finalizeOnce(a)
		}
	}
}

// ---------- FINALIZE AUCTION ONCE ----------

func (s *AuctionService) finalizeOnce(a model.Auction) {
	// коротко лочим только доступ к map
	s.mu.Lock()
	if s.finished[a.ID] {
		s.mu.Unlock()
		return
	}
	// помечаем аукцион завершённым СРАЗУ,
	// чтобы даже при ошибке order он больше не повторялся
	s.finished[a.ID] = true
	s.mu.Unlock()

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

		// создаём order из аукциона
		if err := s.orderSvc.CreateFromAuction(
			maxBid.UserID,
			a.CarID,
			maxBid.Amount,
		); err != nil {
			log.Println("error creating order from auction:", err)
		}
	} else {
		log.Printf("Auction %d FINISHED with no bids\n", a.ID)
	}
}
