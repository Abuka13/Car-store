package service

import (
	"errors"

	"car-store/internal/model"

	"golang.org/x/crypto/bcrypt"
)

type UserRepo interface {
	Create(u *model.User) error
}

type UserService struct {
	repo UserRepo
}

func NewUserService(repo UserRepo) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) CreateUser(u *model.User) error {
	if u.Email == "" || u.Password == "" {
		return errors.New("email and password required")
	}

	hash, err := bcrypt.GenerateFromPassword(
		[]byte(u.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	u.PasswordHash = string(hash)
	u.Role = "user"

	return s.repo.Create(u)
}
