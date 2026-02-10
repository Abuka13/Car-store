package service

import (
	"errors"

	"car-store/internal/model"
)

var ErrAlreadyInFavorites = errors.New("car already in favorites")

type FavoriteRepo interface {
	Add(userID, carID int64) error
	Remove(userID, carID int64) error
	Exists(userID, carID int64) (bool, error)
	GetByUser(userID int64) ([]model.Car, error)
}

type FavoriteService struct {
	repo FavoriteRepo
}

func NewFavoriteService(repo FavoriteRepo) *FavoriteService {
	return &FavoriteService{repo: repo}
}

func (s *FavoriteService) AddToFavorites(userID, carID int64) error {
	exists, err := s.repo.Exists(userID, carID)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyInFavorites
	}
	return s.repo.Add(userID, carID)
}

func (s *FavoriteService) RemoveFromFavorites(userID, carID int64) error {
	return s.repo.Remove(userID, carID)
}

func (s *FavoriteService) GetMyFavorites(userID int64) ([]model.Car, error) {
	return s.repo.GetByUser(userID)
}
