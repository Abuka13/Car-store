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

	// --------------------
	// SERVICES
	// --------------------
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
