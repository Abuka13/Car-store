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
		if r.Method == http.MethodPost {
			carHandler.CreateCar(w, r)
			return
		}
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
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
