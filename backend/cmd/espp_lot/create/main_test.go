package main

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"github.com/ljhurst/fife/pkg/models"
	"github.com/stretchr/testify/assert"
)

func TestHandler(t *testing.T) {
	testCases := []struct {
		name                 string
		request              events.APIGatewayProxyRequest
		mockLot              *models.EsppLotInput
		mockError            error
		expectedStatusCode   int
		expectedBodyContains string
	}{
		{
			name: "successful creation",
			request: events.APIGatewayProxyRequest{
				Body: `{
					"userId": "user123",
					"grantDate": "2023-01-01",
					"purchaseDate": "2023-06-30",
					"offerStartPrice": 100.0,
					"offerEndPrice": 120.0,
					"purchasePrice": 85.0,
					"shares": 10.0
				}`,
			},
			mockLot: &models.EsppLotInput{
				UserID:          "user123",
				GrantDate:       "2023-01-01",
				PurchaseDate:    "2023-06-30",
				OfferStartPrice: 100.0,
				OfferEndPrice:   120.0,
				PurchasePrice:   85.0,
				Shares:          10.0,
			},
			mockError:            nil,
			expectedStatusCode:   201,
			expectedBodyContains: `"userId":"user123"`,
		},
		{
			name: "invalid request body",
			request: events.APIGatewayProxyRequest{
				Body: `{invalid json}`,
			},
			mockLot:              nil,
			mockError:            nil,
			expectedStatusCode:   400,
			expectedBodyContains: `"error":"Invalid request body"`,
		},
		{
			name: "database error",
			request: events.APIGatewayProxyRequest{
				Body: `{
					"userId": "user123",
					"grantDate": "2023-01-01",
					"purchaseDate": "2023-06-30",
					"offerStartPrice": 100.0,
					"offerEndPrice": 120.0,
					"purchasePrice": 85.0,
					"shares": 10.0
				}`,
			},
			mockLot:              nil,
			mockError:            errors.New("database error"),
			expectedStatusCode:   500,
			expectedBodyContains: `"error":"Failed to create ESPP lot"`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockCreateEsppLot := func(svc dynamodbiface.DynamoDBAPI, lot models.EsppLotInput) (*models.EsppLot, error) {
				if tc.mockError != nil {
					return nil, tc.mockError
				}

				return models.NewEsppLot(lot), nil
			}

			handler := handlerWithDeps(mockCreateEsppLot)
			response, err := handler(context.Background(), tc.request)

			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, response.StatusCode)
			assert.Contains(t, response.Body, tc.expectedBodyContains)

			// For successful creation, verify the response contains a valid JSON object
			if tc.expectedStatusCode == 201 {
				var responseBody map[string]interface{}
				err := json.Unmarshal([]byte(response.Body), &responseBody)
				assert.NoError(t, err)
				assert.NotEmpty(t, responseBody["id"])
				assert.NotEmpty(t, responseBody["createdAt"])
			}
		})
	}
}
