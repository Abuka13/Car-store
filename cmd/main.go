package main

import (
	"log"
	"net/http"
	"time"

	"car-store/internal/config"
	"car-store/internal/handler"
	"car-store/internal/middleware"
	"car-store/internal/repository"
	"car-store/internal/service"
)

func main() {
	// --------------------
	// DB
	// --------------------
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	log.Println("Connected to PostgreSQL")

	// --------------------
	// REPOSITORIES
	// --------------------
	carRepo := repository.NewCarRepository(db)
	auctionRepo := repository.NewAuctionRepository(db)
	bidRepo := repository.NewBidRepository(db)
	userRepo := repository.NewUserRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	favoriteRepo := repository.NewFavoriteRepository(db)
	tradeInRepo := repository.NewTradeInRepository(db)

	// --------------------
	// SERVICES
	// --------------------
	tradeInService := service.NewTradeInService(tradeInRepo)
	carService := service.NewCarService(carRepo)

	orderService := service.NewOrderService(orderRepo, carRepo)

	auctionService := service.NewAuctionService(
		auctionRepo,
		carRepo,
		bidRepo,
		orderService,
	)

	authService := service.NewAuthService(userRepo)
	favoriteService := service.NewFavoriteService(favoriteRepo)

	// --------------------
	// HANDLERS
	// --------------------
	carHandler := handler.NewCarHandler(carService)
	auctionHandler := handler.NewAuctionHandler(auctionService)
	bidHandler := handler.NewBidHandler(auctionService)
	authHandler := handler.NewAuthHandler(authService)
	orderHandler := handler.NewOrderHandler(orderService)
	favoriteHandler := handler.NewFavoriteHandler(favoriteService)
	tradeInHandler := handler.NewTradeInHandler(tradeInService)

	// --------------------
	// AUTH (PUBLIC)
	// --------------------
	http.HandleFunc("/auth/register", authHandler.Register)
	http.HandleFunc("/auth/login", authHandler.Login)

	// --------------------
	// CARS
	// --------------------
	http.HandleFunc("/cars", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {

		case http.MethodGet:
			middleware.Auth(carHandler.GetCars)(w, r)

		case http.MethodPost:
			middleware.Auth(
				middleware.AdminOnly(carHandler.CreateCar),
			)(w, r)

		case http.MethodPut:
			middleware.Auth(
				middleware.AdminOnly(carHandler.UpdateCar),
			)(w, r)

		case http.MethodDelete:
			middleware.Auth(
				middleware.AdminOnly(carHandler.DeleteCar),
			)(w, r)

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// --------------------
	// TRADE-IN ROUTES
	// --------------------

	// /trade-ins
	// POST  -> CreateTradeIn
	// GET   -> GetTradeIn (через ?id=123)
	// DELETE-> DeleteTradeIn (через ?id=123)
	http.HandleFunc("/trade-ins", middleware.Auth(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			tradeInHandler.CreateTradeIn(w, r)
		case http.MethodGet:
			tradeInHandler.GetTradeIn(w, r)
		case http.MethodDelete:
			tradeInHandler.DeleteTradeIn(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// /trade-ins/my
	// GET -> GetUserTradeIns
	http.HandleFunc("/trade-ins/my", middleware.Auth(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			tradeInHandler.GetUserTradeIns(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// /trade-ins/set-payment?id=123
	// POST -> SetUserPayment
	http.HandleFunc("/trade-ins/set-payment", middleware.Auth(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			tradeInHandler.SetUserPayment(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// /trade-ins/reject?id=123
	// POST -> RejectTradeIn
	http.HandleFunc("/trade-ins/reject", middleware.Auth(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			tradeInHandler.RejectTradeIn(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// --------------------
	// ADMIN TRADE-IN ROUTES
	// --------------------

	// /admin/trade-ins?status=pending
	// GET -> GetAllTradeIns
	http.HandleFunc("/admin/trade-ins", middleware.Auth(
		middleware.AdminOnly(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				tradeInHandler.GetAllTradeIns(w, r)
			default:
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			}
		}),
	))

	// /admin/trade-ins/evaluate?id=123
	// POST -> EvaluateTradeIn
	http.HandleFunc("/admin/trade-ins/evaluate", middleware.Auth(
		middleware.AdminOnly(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodPost:
				tradeInHandler.EvaluateTradeIn(w, r)
			default:
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			}
		}),
	))

	// --------------------
	// AUCTIONS
	// --------------------
	http.HandleFunc("/auctions", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {

		case http.MethodGet:
			middleware.Auth(auctionHandler.GetAuctions)(w, r)

		case http.MethodPost:
			middleware.Auth(
				middleware.AdminOnly(auctionHandler.CreateAuction),
			)(w, r)

		case http.MethodPut:
			middleware.Auth(
				middleware.AdminOnly(auctionHandler.UpdateAuction),
			)(w, r)

		case http.MethodDelete:
			middleware.Auth(
				middleware.AdminOnly(auctionHandler.DeleteAuction),
			)(w, r)

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// --------------------
	// BIDS
	// --------------------
	http.HandleFunc(
		"/auctions/bid",
		middleware.Auth(bidHandler.PlaceBid),
	)

	// --------------------
	// FAVORITES
	// --------------------
	http.HandleFunc(
		"/favorites",
		middleware.Auth(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				favoriteHandler.GetMy(w, r)
			case http.MethodPost:
				favoriteHandler.Add(w, r)
			case http.MethodDelete:
				favoriteHandler.Remove(w, r)
			default:
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			}
		}),
	)

	// --------------------
	// ORDERS
	// --------------------
	http.HandleFunc(
		"/orders/buy",
		middleware.Auth(orderHandler.Buy),
	)

	http.HandleFunc(
		"/orders/my",
		middleware.Auth(orderHandler.GetMy),
	)

	// --------------------
	// BACKGROUND WORKER
	// --------------------
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			auctionService.CheckAuctionsEvery5Sec()
		}
	}()

	// --------------------
	// START SERVER
	// --------------------
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
