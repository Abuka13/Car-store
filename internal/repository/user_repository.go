package repository

import (
	"database/sql"

	"car-store/internal/model"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(u *model.User) error {
	query := `
		INSERT INTO users (email, password_hash, role)
		VALUES ($1, $2, $3)
		RETURNING id
	`
	return r.db.QueryRow(
		query,
		u.Email,
		u.PasswordHash,
		u.Role,
	).Scan(&u.ID)
}
