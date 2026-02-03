package service

import "car-store/internal/model"

// 👇 ОТДЕЛЬНЫЙ интерфейс ТОЛЬКО для CarService
type CarRepository interface {
	Create(car *model.Car) error
}

type CarService struct {
	repo CarRepository
}

func NewCarService(repo CarRepository) *CarService {
	return &CarService{repo: repo}
}

func (s *CarService) CreateCar(car *model.Car) error {
	return s.repo.Create(car)
}
