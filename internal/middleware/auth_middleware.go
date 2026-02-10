package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("dbc89d984cb0529f2ce6512703389e7f")

type ctxKey string

const (
	UserIDKey ctxKey = "user_id"
	RoleKey   ctxKey = "role"
	EmailKey  ctxKey = "email"
)

// --------------------
// AUTH (JWT)
// --------------------
func Auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "missing token", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(jwt.MapClaims)

		userID := int64(claims["user_id"].(float64))
		role := claims["role"].(string)
		email := claims["email"].(string)

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, RoleKey, role)
		ctx = context.WithValue(ctx, EmailKey, email)

		next(w, r.WithContext(ctx))
	}
}

// --------------------
// ADMIN ONLY
// --------------------
func AdminOnly(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role, ok := r.Context().Value(RoleKey).(string)
		if !ok || role != "admin" {
			http.Error(w, "admin access required", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

// --------------------
// GET USER FROM CONTEXT
// --------------------
func GetUserFromContext(ctx context.Context) (int64, string, string, error) {
	userID, ok := ctx.Value(UserIDKey).(int64)
	if !ok {
		return 0, "", "", errors.New("no user id")
	}

	role, _ := ctx.Value(RoleKey).(string)
	email, _ := ctx.Value(EmailKey).(string)

	return userID, role, email, nil
}
