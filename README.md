# Car-store

Car-store is a monolithic web application written in Go (Golang), developed as part of the Advanced Programming (AP1) course

The project implements a backend service for a car marketplace. It includes basic car management and an auction system, demonstrating server-side application architecture, database interaction, and REST-style API design.

---

## Project Description

The application is designed using a layered architecture approach. Each layer has a clear responsibility, which improves code readability, maintainability, and scalability.

The system allows:
- Managing cars
- Creating and managing auctions for cars
- Persisting data in a PostgreSQL database
- Exposing functionality through an HTTP API

---

## Architecture Overview

The project follows a classic layered structure:

- **handler** – handles HTTP requests and responses
- **service** – contains business logic
- **repository** – responsible for database operations
- **model** – defines application data structures
- **config** – manages configuration and database connection

This separation helps isolate business logic from transport and data access layers.

---

## Technologies Used

- Go (Golang)
- net/http
- PostgreSQL
- database/sql
- JSON
- Git and GitHub

---

## Project Structure

```text
Car-store/
├── internal/
│   ├── config/
│   ├── handler/
│   ├── model/
│   ├── repository/
│   └── service/
├── go.mod
├── go.sum
└── main.go
