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
		auctionRepo,
		carRepo,
		bidRepo,
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
	// ROUTES
	// --------------------
	mux := http.NewServeMux()

	// AUTH
	mux.HandleFunc("/auth/register", authHandler.Register)
	mux.HandleFunc("/auth/login", authHandler.Login)
	mux.Handle(
		"/auth/me",
		middleware.Auth(http.HandlerFunc(authHandler.Me)),
	)

	// CARS
	mux.HandleFunc("/cars", func(w http.ResponseWriter, r *http.Request) {
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
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// AUCTIONS
	mux.HandleFunc("/auctions", func(w http.ResponseWriter, r *http.Request) {
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

	// BIDS
	mux.Handle(
		"/auctions/bid",
		middleware.Auth(http.HandlerFunc(bidHandler.PlaceBid)),
	)

	// --------------------
	// BACKGROUND AUCTION CHECK
	// --------------------
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		for range ticker.C {
			auctionService.CheckAuctionsEvery5Sec()
		}
	}()

	// --------------------
	// START SERVER (🔥 CORS HERE 🔥)
	// --------------------
	handlerWithCORS := middleware.CORS(mux)

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", handlerWithCORS))

}
