package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"car-store/internal/middleware"
	"car-store/internal/model"
	"car-store/internal/service"
)

type TradeInHandler struct {
	service service.TradeInService
}

func NewTradeInHandler(service service.TradeInService) *TradeInHandler {
	return &TradeInHandler{service: service}
}

// --------------------
// POST /trade-ins
// --------------------
func (h *TradeInHandler) CreateTradeIn(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok || userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req model.CreateTradeInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	tradeIn, err := h.service.CreateTradeIn(r.Context(), userID, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(model.TradeInResponse{
		Message: "Trade-in request created successfully",
		TradeIn: tradeIn,
	})
}

// --------------------
// GET /trade-ins?id=123
// --------------------
func (h *TradeInHandler) GetTradeIn(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok || userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	role, _ := r.Context().Value(middleware.RoleKey).(string)
	isAdmin := role == "admin"

	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid trade-in id", http.StatusBadRequest)
		return
	}

	tradeIn, err := h.service.GetTradeIn(r.Context(), id, userID, isAdmin)
	if err != nil {
		if err.Error() == "access denied" {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		if err.Error() == "trade-in not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(tradeIn)
}

// --------------------
// GET /trade-ins/my
// --------------------
func (h *TradeInHandler) GetUserTradeIns(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok || userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	tradeIns, err := h.service.GetUserTradeIns(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(tradeIns)
}

// --------------------
// ADMIN: GET /admin/trade-ins
// --------------------
func (h *TradeInHandler) GetAllTradeIns(w http.ResponseWriter, r *http.Request) {

	status := r.URL.Query().Get("status")

	tradeIns, err := h.service.GetAllTradeIns(r.Context(), status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(tradeIns)
}

// --------------------
// ADMIN: POST /admin/trade-ins/evaluate?id=123
// --------------------
func (h *TradeInHandler) EvaluateTradeIn(w http.ResponseWriter, r *http.Request) {

	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid trade-in id", http.StatusBadRequest)
		return
	}

	var req model.EvaluateTradeInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	tradeIn, err := h.service.EvaluateTradeIn(r.Context(), id, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(model.TradeInResponse{
		Message: "Trade-in evaluated successfully",
		TradeIn: tradeIn,
	})
}

// --------------------
// POST /trade-ins/set-payment?id=123
// --------------------
func (h *TradeInHandler) SetUserPayment(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok || userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid trade-in id", http.StatusBadRequest)
		return
	}

	var req model.SetUserPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	kolesaURL, err := h.service.SetUserPayment(r.Context(), id, userID, req)
	if err != nil {
		if err.Error() == "access denied" {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(model.TradeInResponse{
		Message:         "Payment set successfully",
		KolesaSearchURL: kolesaURL,
	})
}

// --------------------
// POST /trade-ins/reject?id=123
// --------------------
func (h *TradeInHandler) RejectTradeIn(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok || userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid trade-in id", http.StatusBadRequest)
		return
	}

	tradeIn, err := h.service.RejectTradeIn(r.Context(), id, userID)
	if err != nil {
		if err.Error() == "access denied" {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(model.TradeInResponse{
		Message: "Trade-in rejected",
		TradeIn: tradeIn,
	})
}

// --------------------
// DELETE /trade-ins?id=123
// --------------------
func (h *TradeInHandler) DeleteTradeIn(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok || userID == 0 {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	role, _ := r.Context().Value(middleware.RoleKey).(string)
	isAdmin := role == "admin"

	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid trade-in id", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteTradeIn(r.Context(), id, userID, isAdmin); err != nil {
		if err.Error() == "access denied" {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		if err.Error() == "trade-in not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
