package main

import (
	"car-store/internal/handler"
	"car-store/internal/repository"
	"car-store/internal/service"
	"log"
	"net/http"

	"car-store/internal/config"
)

func main() {
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	log.Println("Connected to PostgreSQL")
	carRepo := repository.NewCarRepository(db)
	carService := service.NewCarService(carRepo)
	carHandler := handler.NewCarHandler(carService)

	http.HandleFunc("/cars", carHandler.CreateCar)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
