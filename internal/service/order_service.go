package service

import (
	"errors"

	"car-store/internal/model"
)

var (
	ErrCarAlreadySold = errors.New("car already sold")
	ErrCarNotFoundO   = errors.New("car not found")
)

type OrderRepo interface {
	Create(o *model.Order) error
	GetByUser(userID int64) ([]model.Order, error)
	ExistsByCarID(carID int64) (bool, error)
}

type CarReadRepo interface {
	GetByID(id int64) (*model.Car, error)
	Update(car *model.Car) error
}

type OrderService struct {
	orderRepo OrderRepo
	carRepo   CarReadRepo
}

func NewOrderService(orderRepo OrderRepo, carRepo CarReadRepo) *OrderService {
	return &OrderService{
		orderRepo: orderRepo,
		carRepo:   carRepo,
	}
}

// ---------- DIRECT PURCHASE ----------
func (s *OrderService) BuyDirect(userID, carID int64) error {
	car, err := s.carRepo.GetByID(carID)
	if err != nil {
		return err
	}
	if car == nil {
		return ErrCarNotFoundO
	}

	exists, err := s.orderRepo.ExistsByCarID(carID)
	if err != nil {
		return err
	}
	if exists {
		return ErrCarAlreadySold
	}

	order := &model.Order{
		UserID:     userID,
		CarID:      carID,
		TotalPrice: car.Price,
		Source:     "direct",
	}

	if err := s.orderRepo.Create(order); err != nil {
		return err
	}

	car.Status = "sold"
	return s.carRepo.Update(car)
}

func (s *OrderService) CreateFromAuction(
	userID, carID int64,
	price float64,
) error {

	sold, err := s.orderRepo.ExistsByCarID(carID)
	if err != nil {
		return err
	}
	if sold {
		return ErrCarAlreadySold
	}

	order := &model.Order{
		UserID:     userID,
		CarID:      carID,
		TotalPrice: price,
		Source:     "auction",
	}

	if err := s.orderRepo.Create(order); err != nil {
		return err
	}

	car, err := s.carRepo.GetByID(carID)
	if err != nil {
		return err
	}

	car.Status = "sold"
	return s.carRepo.Update(car)
}

func (s *OrderService) GetMyOrders(userID int64) ([]model.Order, error) {
	return s.orderRepo.GetByUser(userID)
}
