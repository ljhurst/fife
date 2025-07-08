package main

import (
	"context"
	"errors"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"github.com/ljhurst/fife/pkg/models"
	"github.com/stretchr/testify/assert"
)

func TestHandler(t *testing.T) {
	testCases := []struct {
		name               string
		request            events.APIGatewayProxyRequest
		mockLots           []*models.EsppLot
		mockError          error
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name: "successful retrieval",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"userId": "user123",
				},
			},
			mockLots: []*models.EsppLot{
				{
					ID:              "lot123",
					UserID:          "user123",
					GrantDate:       "2023-01-01",
					PurchaseDate:    "2023-06-30",
					OfferStartPrice: 100.0,
					OfferEndPrice:   120.0,
					PurchasePrice:   85.0,
					Shares:          10.0,
					CreatedAt:       "2023-01-01T00:00:00Z",
					UpdatedAt:       "2023-01-01T00:00:00Z",
				},
				{
					ID:              "lot456",
					UserID:          "user123",
					GrantDate:       "2023-07-01",
					PurchaseDate:    "2023-12-31",
					OfferStartPrice: 120.0,
					OfferEndPrice:   140.0,
					PurchasePrice:   95.0,
					Shares:          15.0,
					CreatedAt:       "2023-07-01T00:00:00Z",
					UpdatedAt:       "2023-07-01T00:00:00Z",
				},
			},
			mockError:          nil,
			expectedStatusCode: 200,
			expectedBody:       `[{"id":"lot123","userId":"user123","grantDate":"2023-01-01","purchaseDate":"2023-06-30","offerStartPrice":100,"offerEndPrice":120,"purchasePrice":85,"shares":10,"createdAt":"2023-01-01T00:00:00Z","updatedAt":"2023-01-01T00:00:00Z"},{"id":"lot456","userId":"user123","grantDate":"2023-07-01","purchaseDate":"2023-12-31","offerStartPrice":120,"offerEndPrice":140,"purchasePrice":95,"shares":15,"createdAt":"2023-07-01T00:00:00Z","updatedAt":"2023-07-01T00:00:00Z"}]`,
		},
		{
			name: "no lots found",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"userId": "user456",
				},
			},
			mockLots:           []*models.EsppLot{},
			mockError:          nil,
			expectedStatusCode: 200,
			expectedBody:       `[]`,
		},
		{
			name: "database error",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"userId": "user123",
				},
			},
			mockLots:           nil,
			mockError:          errors.New("database error"),
			expectedStatusCode: 500,
			expectedBody:       `{"error":"Failed to retrieve ESPP lots"}`,
		},
		{
			name: "missing user ID",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{},
			},
			mockLots:           nil,
			mockError:          nil,
			expectedStatusCode: 400,
			expectedBody:       `{"error":"Missing path parameter: userId"}`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockGetEsppLotsByUserID := func(svc dynamodbiface.DynamoDBAPI, userID string) ([]*models.EsppLot, error) {
				return tc.mockLots, tc.mockError
			}

			handler := handlerWithDeps(mockGetEsppLotsByUserID)
			response, err := handler(context.Background(), tc.request)

			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, response.StatusCode)
			assert.Equal(t, tc.expectedBody, response.Body)
		})
	}
}
