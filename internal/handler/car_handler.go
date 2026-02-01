package handler

import (
	"encoding/json"
	"net/http"

	"car-store/internal/model"
	"car-store/internal/service"
)

type CarHandler struct {
	service *service.CarService
}

func NewCarHandler(service *service.CarService) *CarHandler {
	return &CarHandler{service: service}
}

func (h *CarHandler) CreateCar(w http.ResponseWriter, r *http.Request) {
	var car model.Car
	if err := json.NewDecoder(r.Body).Decode(&car); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.CreateCar(&car); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(car)
}
