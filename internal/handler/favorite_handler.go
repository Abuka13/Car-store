package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"car-store/internal/middleware"
	"car-store/internal/service"
)

type FavoriteHandler struct {
	service *service.FavoriteService
}

func NewFavoriteHandler(service *service.FavoriteService) *FavoriteHandler {
	return &FavoriteHandler{service: service}
}

func (h *FavoriteHandler) Add(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	carIDStr := r.URL.Query().Get("car_id")
	carID, err := strconv.ParseInt(carIDStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid car id", http.StatusBadRequest)
		return
	}

	if err := h.service.AddToFavorites(userID, carID); err != nil {
		if err == service.ErrAlreadyInFavorites {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *FavoriteHandler) Remove(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	carIDStr := r.URL.Query().Get("car_id")
	carID, err := strconv.ParseInt(carIDStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid car id", http.StatusBadRequest)
		return
	}

	if err := h.service.RemoveFromFavorites(userID, carID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *FavoriteHandler) GetMy(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	cars, err := h.service.GetMyFavorites(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(cars)
}
