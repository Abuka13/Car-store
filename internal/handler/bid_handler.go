package handler

import (
	"encoding/json"
	"net/http"

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
	UserID    int64   `json:"user_id"`
	Amount    float64 `json:"amount"`
}

func (h *BidHandler) PlaceBid(w http.ResponseWriter, r *http.Request) {
	var req PlaceBidRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.auctionService.PlaceBid(
		req.AuctionID,
		req.UserID,
		req.Amount,
	); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
