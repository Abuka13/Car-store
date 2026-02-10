package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"car-store/internal/middleware"
	"car-store/internal/service"
)

type OrderHandler struct {
	service *service.OrderService
}

func NewOrderHandler(service *service.OrderService) *OrderHandler {
	return &OrderHandler{service: service}
}

func (h *OrderHandler) Buy(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	carIDStr := r.URL.Query().Get("car_id")
	carID, err := strconv.ParseInt(carIDStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid car id", http.StatusBadRequest)
		return
	}

	if err := h.service.BuyDirect(userID, carID); err != nil {
		switch err {
		case service.ErrCarNotFound:
			http.Error(w, err.Error(), http.StatusNotFound)
		case service.ErrCarAlreadySold:
			http.Error(w, err.Error(), http.StatusConflict)
		default:
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *OrderHandler) GetMy(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	orders, err := h.service.GetMyOrders(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(orders)
}
