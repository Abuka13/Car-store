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

// ❗ user_id УБРАН из body
type PlaceBidRequest struct {
	AuctionID int64   `json:"auction_id"`
	Amount    float64 `json:"amount"`
}

func (h *BidHandler) PlaceBid(w http.ResponseWriter, r *http.Request) {
	// user_id ТОЛЬКО из JWT
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	var req PlaceBidRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.auctionService.PlaceBid(
		req.AuctionID,
		userID,
		req.Amount,
	); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
