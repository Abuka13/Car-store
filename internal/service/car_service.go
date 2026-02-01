package service

import "car-store/internal/model"

type CarRepo interface {
	Create(car *model.Car) error
}

type CarService struct {
	repo CarRepo
}

func NewCarService(repo CarRepo) *CarService {
	return &CarService{repo: repo}
}

func (s *CarService) CreateCar(car *model.Car) error {
	if car.Status == "" {
		car.Status = "available"
	}
	return s.repo.Create(car)
}
