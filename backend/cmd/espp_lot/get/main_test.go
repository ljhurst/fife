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
		mockLot            *models.EsppLot
		mockError          error
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name: "successful retrieval",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"lotId": "lot123",
				},
			},
			mockLot: &models.EsppLot{
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
			mockError:          nil,
			expectedStatusCode: 200,
			expectedBody:       `{"id":"lot123","userId":"user123","grantDate":"2023-01-01","purchaseDate":"2023-06-30","offerStartPrice":100,"offerEndPrice":120,"purchasePrice":85,"shares":10,"createdAt":"2023-01-01T00:00:00Z","updatedAt":"2023-01-01T00:00:00Z"}`,
		},
		{
			name: "lot not found",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"lotId": "nonexistent",
				},
			},
			mockLot:            nil,
			mockError:          nil,
			expectedStatusCode: 404,
			expectedBody:       `{"error":"ESPP lot not found"}`,
		},
		{
			name: "database error",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"lotId": "lot123",
				},
			},
			mockLot:            nil,
			mockError:          errors.New("database error"),
			expectedStatusCode: 500,
			expectedBody:       `{"error":"Failed to retrieve ESPP lot"}`,
		},
		{
			name: "missing lot ID",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{},
			},
			mockLot:            nil,
			mockError:          nil,
			expectedStatusCode: 400,
			expectedBody:       `{"error":"Missing path parameter: lotId"}`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockGetEsppLot := func(svc dynamodbiface.DynamoDBAPI, id string) (*models.EsppLot, error) {
				return tc.mockLot, tc.mockError
			}

			handler := handlerWithDeps(mockGetEsppLot)
			response, err := handler(context.Background(), tc.request)

			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, response.StatusCode)
			assert.Equal(t, tc.expectedBody, response.Body)
		})
	}
}
