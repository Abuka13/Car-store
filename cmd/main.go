package main

import (
	"log"
	"net/http"
	"time"

	"car-store/internal/config"
	"car-store/internal/handler"

	"car-store/internal/repository"
	"car-store/internal/service"
)

func main() {

	db, err := config.ConnectDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	log.Println("Connected to PostgreSQL")

	carRepo := repository.NewCarRepository(db)
	auctionRepo := repository.NewAuctionRepository(db)
	bidRepo := repository.NewBidRepository(db)

	carService := service.NewCarService(carRepo)
	auctionService := service.NewAuctionService(auctionRepo, bidRepo)

	carHandler := handler.NewCarHandler(carService)
	auctionHandler := handler.NewAuctionHandler(auctionService)
	bidHandler := handler.NewBidHandler(auctionService)

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

	http.HandleFunc("/auctions/bid", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			bidHandler.PlaceBid(w, r)
			return
		}
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	http.HandleFunc("/bids", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			bidHandler.PlaceBid(w, r)
			return
		}
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	go func() {
		ticker := time.NewTicker(5 * time.Second)
		for range ticker.C {
			auctionService.CheckAuctionsEvery5Sec()
		}
	}()

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
