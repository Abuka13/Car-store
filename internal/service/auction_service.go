package service

import "car-store/internal/model"

type AuctionRepo interface {
	Create(a *model.Auction) error
	GetAll() ([]model.Auction, error)
	Update(a *model.Auction) error
	Delete(id int64) error
}

type AuctionService struct {
	repo AuctionRepo
}

func NewAuctionService(repo AuctionRepo) *AuctionService {
	return &AuctionService{repo: repo}
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
