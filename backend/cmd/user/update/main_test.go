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
		mockUser           *models.User
		mockError          error
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name: "Success",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"userId": "user123",
				},
				Body: `{"finance":{"annualSalary":120000,"paychecksPerYear":24}}`,
			},
			mockUser: &models.User{
				UserID: "user123",
				Settings: models.UserSettings{
					Finance: models.UserFinanceSettings{
						AnnualSalary:     120000,
						PaychecksPerYear: 24,
					},
				},
				CreatedAt: "2023-01-01T00:00:00Z",
				UpdatedAt: "2023-01-02T00:00:00Z",
			},
			mockError:          nil,
			expectedStatusCode: 200,
			expectedBody:       `{"userId":"user123","settings":{"finance":{"annualSalary":120000,"paychecksPerYear":24}},"createdAt":"2023-01-01T00:00:00Z","updatedAt":"2023-01-02T00:00:00Z"}`,
		},
		{
			name: "Missing User ID",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{},
				Body:           `{"finance":{"annualSalary":120000,"paychecksPerYear":24}}`,
			},
			mockUser:           nil,
			mockError:          nil,
			expectedStatusCode: 400,
			expectedBody:       `{"error":"Missing path parameter: userId"}`,
		},
		{
			name: "Invalid Request Body",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"userId": "user123",
				},
				Body: `{invalid json}`,
			},
			mockUser:           nil,
			mockError:          nil,
			expectedStatusCode: 400,
			expectedBody:       `{"error":"Invalid request body"}`,
		},
		{
			name: "Database Error",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"userId": "user123",
				},
				Body: `{"finance":{"annualSalary":120000,"paychecksPerYear":24}}`,
			},
			mockUser:           nil,
			mockError:          errors.New("database error"),
			expectedStatusCode: 500,
			expectedBody:       `{"error":"Failed to update user settings"}`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockUpdateUserSettingsFn := func(_ dynamodbiface.DynamoDBAPI, _ string, _ models.UserSettings) (*models.User, error) {
				return tc.mockUser, tc.mockError
			}

			handlerFn := handlerWithDeps(mockUpdateUserSettingsFn)

			response, err := handlerFn(context.Background(), tc.request)

			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, response.StatusCode)

			if tc.expectedStatusCode == 200 {
				assert.JSONEq(t, tc.expectedBody, response.Body)
			} else {
				assert.Equal(t, tc.expectedBody, response.Body)
			}
		})
	}
}
