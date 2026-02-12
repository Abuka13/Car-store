package service

import (
	"context"
	"fmt"

	"car-store/internal/model"
	"car-store/internal/repository"
	"car-store/internal/utility"
)

type TradeInService interface {
	CreateTradeIn(ctx context.Context, userID int64, req model.CreateTradeInRequest) (*model.TradeIn, error)
	GetTradeIn(ctx context.Context, id int64, userID int64, isAdmin bool) (*model.TradeIn, error)
	GetUserTradeIns(ctx context.Context, userID int64) ([]model.TradeIn, error)
	GetAllTradeIns(ctx context.Context, status string) ([]model.TradeIn, error)
	EvaluateTradeIn(ctx context.Context, id int64, req model.EvaluateTradeInRequest) (*model.TradeIn, error)
	SetUserPayment(ctx context.Context, id int64, userID int64, req model.SetUserPaymentRequest) (string, error)
	RejectTradeIn(ctx context.Context, id int64, userID int64) (*model.TradeIn, error)
	DeleteTradeIn(ctx context.Context, id int64, userID int64, isAdmin bool) error
}

type tradeInService struct {
	repo repository.TradeInRepository
}

func NewTradeInService(repo repository.TradeInRepository) TradeInService {
	return &tradeInService{repo: repo}
}

func (s *tradeInService) CreateTradeIn(ctx context.Context, userID int64, req model.CreateTradeInRequest) (*model.TradeIn, error) {
	tradeIn := &model.TradeIn{
		UserID:       userID,
		OfferedBrand: req.OfferedBrand,
		OfferedModel: req.OfferedModel,
		Year:         req.Year,
		Mileage:      req.Mileage,
		DesiredCarID: req.DesiredCarID,
	}

	if err := s.repo.Create(ctx, tradeIn); err != nil {
		return nil, fmt.Errorf("failed to create trade-in: %w", err)
	}

	return tradeIn, nil
}

func (s *tradeInService) GetTradeIn(ctx context.Context, id int64, userID int64, isAdmin bool) (*model.TradeIn, error) {
	tradeIn, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Проверяем права доступа
	if !isAdmin && tradeIn.UserID != userID {
		return nil, fmt.Errorf("access denied")
	}

	return tradeIn, nil
}

func (s *tradeInService) GetUserTradeIns(ctx context.Context, userID int64) ([]model.TradeIn, error) {
	return s.repo.GetByUserID(ctx, userID)
}

func (s *tradeInService) GetAllTradeIns(ctx context.Context, status string) ([]model.TradeIn, error) {
	return s.repo.GetAll(ctx, status)
}

func (s *tradeInService) EvaluateTradeIn(ctx context.Context, id int64, req model.EvaluateTradeInRequest) (*model.TradeIn, error) {
	// Проверяем что заявка существует
	tradeIn, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Проверяем что заявка в статусе pending
	if tradeIn.Status != "pending" {
		return nil, fmt.Errorf("trade-in must be in pending status to be evaluated")
	}

	// Оцениваем заявку
	if err := s.repo.Evaluate(ctx, id, req.EstimatedPrice); err != nil {
		return nil, err
	}

	// Возвращаем обновленную заявку
	return s.repo.GetByID(ctx, id)
}

// SetUserPayment - юзер указывает сколько готов доплатить, возвращается ссылка на kolesa.kz
func (s *tradeInService) SetUserPayment(ctx context.Context, id int64, userID int64, req model.SetUserPaymentRequest) (string, error) {
	// Получаем заявку
	tradeIn, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return "", err
	}

	// Проверяем владельца
	if tradeIn.UserID != userID {
		return "", fmt.Errorf("access denied")
	}

	// Проверяем статус
	if tradeIn.Status != "evaluated" {
		return "", fmt.Errorf("trade-in must be evaluated before setting payment")
	}

	// Проверяем что есть оценка
	if tradeIn.EstimatedPrice == nil {
		return "", fmt.Errorf("trade-in has no estimated price")
	}

	// Генерируем URL для kolesa.kz
	kolesaURL := utility.GenerateKolesaURLFromPayment(*tradeIn.EstimatedPrice, req.UserPayment)

	// Сохраняем user_payment и обновляем статус
	if err := s.repo.SetUserPayment(ctx, id, req.UserPayment, kolesaURL); err != nil {
		return "", err
	}

	// Возвращаем ссылку на kolesa.kz
	return kolesaURL, nil
}

func (s *tradeInService) RejectTradeIn(ctx context.Context, id int64, userID int64) (*model.TradeIn, error) {
	// Получаем заявку
	tradeIn, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Проверяем владельца
	if tradeIn.UserID != userID {
		return nil, fmt.Errorf("access denied")
	}

	// Проверяем статус
	if tradeIn.Status != "evaluated" {
		return nil, fmt.Errorf("trade-in must be evaluated before rejection")
	}

	// Обновляем статус
	if err := s.repo.UpdateStatus(ctx, id, "rejected"); err != nil {
		return nil, err
	}

	// Возвращаем обновленную заявку
	return s.repo.GetByID(ctx, id)
}

func (s *tradeInService) DeleteTradeIn(ctx context.Context, id int64, userID int64, isAdmin bool) error {
	// Получаем заявку
	tradeIn, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Проверяем права
	if !isAdmin && tradeIn.UserID != userID {
		return fmt.Errorf("access denied")
	}

	// Удаляем
	return s.repo.Delete(ctx, id)
}
