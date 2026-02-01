package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"car-store/internal/model"
	"car-store/internal/service"
)

type AuctionHandler struct {
	service *service.AuctionService
}

func NewAuctionHandler(service *service.AuctionService) *AuctionHandler {
	return &AuctionHandler{service: service}
}

func (h *AuctionHandler) CreateAuction(w http.ResponseWriter, r *http.Request) {
	var a model.Auction
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.CreateAuction(&a); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(a)
}

func (h *AuctionHandler) GetAuctions(w http.ResponseWriter, r *http.Request) {
	auctions, err := h.service.GetAuctions()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(auctions)
}

func (h *AuctionHandler) UpdateAuction(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid auction id", http.StatusBadRequest)
		return
	}

	var a model.Auction
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	a.ID = id

	if err := h.service.UpdateAuction(&a); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *AuctionHandler) DeleteAuction(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid auction id", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteAuction(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
