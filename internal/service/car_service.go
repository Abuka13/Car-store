package service

import "car-store/internal/model"

type CarRepo interface {
	Create(car *model.Car) error
	GetAll() ([]model.Car, error)
	GetByID(id int64) (*model.Car, error)
	Update(car *model.Car) error
	Delete(id int64) error
	ExistsByID(id int64) (bool, error)
}

type CarService struct {
	repo CarRepo
}

func NewCarService(repo CarRepo) *CarService {
	return &CarService{repo: repo}
}

func (s *CarService) CreateCar(car *model.Car) error {
	return s.repo.Create(car)
}

func (s *CarService) GetCars() ([]model.Car, error) {
	return s.repo.GetAll()
}

func (s *CarService) GetCarByID(id int64) (*model.Car, error) {
	return s.repo.GetByID(id)
}

func (s *CarService) UpdateCar(car *model.Car) error {
	return s.repo.Update(car)
}

func (s *CarService) DeleteCar(id int64) error {
	return s.repo.Delete(id)
}
