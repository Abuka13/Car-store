package handler

import (
	"encoding/json"
	"net/http"

	"car-store/internal/middleware"
	"car-store/internal/service"
)

type BidHandler struct {
	auctionService *service.AuctionService
}

func NewBidHandler(auctionService *service.AuctionService) *BidHandler {
	return &BidHandler{auctionService: auctionService}
}

type PlaceBidRequest struct {
	AuctionID int64   `json:"auction_id"`
	Amount    float64 `json:"amount"`
}

// ✅ ИСПРАВЛЕНО: Возвращается обновленная информация об аукционе
type PlaceBidResponse struct {
	Success       bool    `json:"success"`
	Message       string  `json:"message"`
	NewPrice      float64 `json:"new_price"`
	YourBid       float64 `json:"your_bid"`
	PriceIncrease float64 `json:"price_increase"`
	BidCount      int     `json:"bid_count"`
}

func (h *BidHandler) PlaceBid(w http.ResponseWriter, r *http.Request) {
	// Проверка Content-Type
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "Content-Type must be application/json", http.StatusUnsupportedMediaType)
		return
	}

	// user_id ТОЛЬКО из JWT
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	var req PlaceBidRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// ✅ ИСПРАВЛЕНО: Валидация входных данных
	if req.AuctionID <= 0 {
		http.Error(w, "invalid auction_id", http.StatusBadRequest)
		return
	}
	if req.Amount <= 0 {
		http.Error(w, "amount must be positive", http.StatusBadRequest)
		return
	}

	// ✅ ИСПРАВЛЕНО: Получаем старую цену ДО размещения ставки
	auctionBefore, err := h.auctionService.GetAuctionByID(req.AuctionID)
	if err != nil {
		http.Error(w, "auction not found: "+err.Error(), http.StatusNotFound)
		return
	}

	oldPrice := auctionBefore.CurrentPrice
	if oldPrice == 0 {
		oldPrice = auctionBefore.StartPrice
	}

	// Размещаем ставку
	if err := h.auctionService.PlaceBid(
		req.AuctionID,
		userID,
		req.Amount,
	); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// ✅ ИСПРАВЛЕНО: Получаем обновленную информацию об аукционе
	auctionAfter, err := h.auctionService.GetAuctionByID(req.AuctionID)
	if err != nil {
		// Ставка размещена, но не можем получить обновленную информацию
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(PlaceBidResponse{
			Success:       true,
			Message:       "Bid placed successfully",
			NewPrice:      req.Amount,
			YourBid:       req.Amount,
			PriceIncrease: req.Amount - oldPrice,
			BidCount:      auctionBefore.BidCount + 1,
		})
		return
	}

	// Отправляем подробный ответ
	response := PlaceBidResponse{
		Success:       true,
		Message:       "Bid placed successfully!",
		NewPrice:      auctionAfter.CurrentPrice,
		YourBid:       req.Amount,
		PriceIncrease: auctionAfter.CurrentPrice - oldPrice,
		BidCount:      auctionAfter.BidCount,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		println("Error encoding response:", err.Error())
	}
}
