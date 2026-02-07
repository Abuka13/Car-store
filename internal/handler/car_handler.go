package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

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
func (h *CarHandler) GetCars(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")

	if idStr != "" {
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid car id", 400)
			return
		}
		car, err := h.service.GetCarByID(id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		if car == nil {
			http.Error(w, "car not found", 404)
			return
		}
		json.NewEncoder(w).Encode(car)
		return
	}

	cars, _ := h.service.GetCars()
	json.NewEncoder(w).Encode(cars)
}

func (h *CarHandler) UpdateCar(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, _ := strconv.ParseInt(idStr, 10, 64)

	var c model.Car
	json.NewDecoder(r.Body).Decode(&c)
	c.ID = id

	h.service.UpdateCar(&c)
	w.WriteHeader(http.StatusOK)
}

func (h *CarHandler) DeleteCar(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, _ := strconv.ParseInt(idStr, 10, 64)

	h.service.DeleteCar(id)
	w.WriteHeader(http.StatusNoContent)
}
