package repository

import (
	"car-store/internal/model"
	"database/sql"
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
		RETURNING id, created_at
	`
	return r.db.QueryRow(
		query,
		u.Email,
		u.PasswordHash,
		u.Role,
	).Scan(&u.ID, &u.CreatedAt)
}

func (r *UserRepository) GetByEmail(email string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRow(`
		SELECT id, email, password_hash, role, created_at
		FROM users WHERE email = $1
	`, email).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.Role,
		&u.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &u, err
}
