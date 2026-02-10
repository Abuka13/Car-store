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

	// --------------------
	// SERVICES
	// --------------------
	carService := service.NewCarService(carRepo)

	auctionService := service.NewAuctionService(
		auctionRepo, // AuctionRepo
		carRepo,     // CarRepo (для проверки машины)
		bidRepo,     // BidRepo
	)

	authService := service.NewAuthService(userRepo)

	// favorites

	favoriteRepo := repository.NewFavoriteRepository(db)
	favoriteService := service.NewFavoriteService(favoriteRepo)
	favoriteHandler := handler.NewFavoriteHandler(favoriteService)

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

	//Order
	orderRepo := repository.NewOrderRepository(db)
	orderService := service.NewOrderService(orderRepo, carRepo)
	orderHandler := handler.NewOrderHandler(orderService)

	http.HandleFunc(
		"/orders/buy",
		middleware.Auth(orderHandler.Buy),
	)

	http.HandleFunc(
		"/orders/my",
		middleware.Auth(orderHandler.GetMy),
	)

	// --------------------
	// HANDLERS
	// --------------------
	carHandler := handler.NewCarHandler(carService)
	auctionHandler := handler.NewAuctionHandler(auctionService)
	bidHandler := handler.NewBidHandler(auctionService)
	authHandler := handler.NewAuthHandler(authService)

	// --------------------
	// AUTH ROUTES
	// --------------------
	http.HandleFunc("/auth/register", authHandler.Register)
	http.HandleFunc("/auth/login", authHandler.Login)

	http.HandleFunc("/cars", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			carHandler.GetCars(w, r)

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
			http.Error(w, "method not allowed", 405)
		}
	})

	http.HandleFunc("/auctions", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			auctionHandler.CreateAuction(w, r)
		case http.MethodGet:
			auctionHandler.GetAuctions(w, r)
		case http.MethodPut:
			auctionHandler.UpdateAuction(w, r)
		case http.MethodDelete:
			auctionHandler.DeleteAuction(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc(
		"/auctions/bid",
		middleware.Auth(bidHandler.PlaceBid),
	)

	go func() {
		ticker := time.NewTicker(5 * time.Second)
		for range ticker.C {
			auctionService.CheckAuctionsEvery5Sec()
		}
	}()

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
