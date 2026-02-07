package service

import (
	"errors"
	"time"

	"car-store/internal/model"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("dbc89d984cb0529f2ce6512703389e7f")

type AuthService struct {
	userRepo UserRepo
}

type UserRepo interface {
	Create(u *model.User) error
	GetByEmail(email string) (*model.User, error)
}

func NewAuthService(userRepo UserRepo) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(email, password string) error {
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	user := &model.User{
		Email:        email,
		PasswordHash: string(hash),
		Role:         "user",
	}

	return s.userRepo.Create(user)
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil || user == nil {
		return "", errors.New("invalid credentials")
	}

	if bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(password),
	) != nil {
		return "", errors.New("invalid credentials")
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}
