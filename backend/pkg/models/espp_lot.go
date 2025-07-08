package models

import (
	"github.com/google/uuid"
	"github.com/ljhurst/fife/pkg/utils"
)

type EsppLotInput struct {
	UserID          string  `json:"userId" dynamodbav:"userId"`
	GrantDate       string  `json:"grantDate" dynamodbav:"grantDate"`
	PurchaseDate    string  `json:"purchaseDate" dynamodbav:"purchaseDate"`
	OfferStartPrice float64 `json:"offerStartPrice" dynamodbav:"offerStartPrice"`
	OfferEndPrice   float64 `json:"offerEndPrice" dynamodbav:"offerEndPrice"`
	PurchasePrice   float64 `json:"purchasePrice" dynamodbav:"purchasePrice"`
	Shares          float64 `json:"shares" dynamodbav:"shares"`
}

type EsppLot struct {
	ID              string  `json:"id" dynamodbav:"id"`
	UserID          string  `json:"userId" dynamodbav:"userId"`
	GrantDate       string  `json:"grantDate" dynamodbav:"grantDate"`
	PurchaseDate    string  `json:"purchaseDate" dynamodbav:"purchaseDate"`
	OfferStartPrice float64 `json:"offerStartPrice" dynamodbav:"offerStartPrice"`
	OfferEndPrice   float64 `json:"offerEndPrice" dynamodbav:"offerEndPrice"`
	PurchasePrice   float64 `json:"purchasePrice" dynamodbav:"purchasePrice"`
	Shares          float64 `json:"shares" dynamodbav:"shares"`
	CreatedAt       string  `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt       string  `json:"updatedAt" dynamodbav:"updatedAt"`
}

func NewEsppLot(input EsppLotInput) *EsppLot {
	now := utils.GetCurrentTimeUTC()

	return &EsppLot{
		ID:              uuid.New().String(),
		UserID:          input.UserID,
		GrantDate:       input.GrantDate,
		PurchaseDate:    input.PurchaseDate,
		OfferStartPrice: input.OfferStartPrice,
		OfferEndPrice:   input.OfferEndPrice,
		PurchasePrice:   input.PurchasePrice,
		Shares:          input.Shares,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}
