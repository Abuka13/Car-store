package utility

import (
	"fmt"
	_ "net/url"
)

func GenerateKolesaURLFromPayment(estimatedPrice, userPayment float64) string {
	// Вычисляем итоговую сумму
	totalBudget := estimatedPrice + userPayment

	// Создаем диапазон ±15% для поиска
	minPrice := int(totalBudget * 0.85)
	maxPrice := int(totalBudget * 1.15)

	// Конвертируем в тенге (1 USD ≈ 450 KZT)
	minPriceKZT := minPrice * 450
	maxPriceKZT := maxPrice * 450

	// Формируем финальный URL
	finalURL := fmt.Sprintf("https://kolesa.kz/cars/?price[from]=%d&price[to]=%d", minPriceKZT, maxPriceKZT)

	return finalURL
}
