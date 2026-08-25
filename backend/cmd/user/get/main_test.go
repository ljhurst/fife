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

func requestWithSub(sub string) events.APIGatewayV2HTTPRequest {
	request := events.APIGatewayV2HTTPRequest{}
	if sub != "" {
		request.RequestContext.Authorizer = &events.APIGatewayV2HTTPRequestContextAuthorizerDescription{
			JWT: &events.APIGatewayV2HTTPRequestContextAuthorizerJWTDescription{
				Claims: map[string]string{"sub": sub},
			},
		}
	}
	return request
}

func TestHandler(t *testing.T) {
	testCases := []struct {
		name               string
		request            events.APIGatewayV2HTTPRequest
		mockUser           *models.User
		mockError          error
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:    "Success",
			request: requestWithSub("user123"),
			mockUser: &models.User{
				UserID: "user123",
				Settings: models.UserSettings{
					Finance: models.UserFinanceSettings{
						AnnualSalary:     100000,
						PaychecksPerYear: 26,
					},
				},
				CreatedAt: "2023-01-01T00:00:00Z",
				UpdatedAt: "2023-01-02T00:00:00Z",
			},
			mockError:          nil,
			expectedStatusCode: 200,
			expectedBody:       `{"userId":"user123","settings":{"finance":{"annualSalary":100000,"paychecksPerYear":26}},"createdAt":"2023-01-01T00:00:00Z","updatedAt":"2023-01-02T00:00:00Z"}`,
		},
		{
			name:               "Missing Subject",
			request:            requestWithSub(""),
			mockUser:           nil,
			mockError:          nil,
			expectedStatusCode: 401,
			expectedBody:       `{"error":"Unauthorized"}`,
		},
		{
			name:               "User Not Found",
			request:            requestWithSub("nonexistent"),
			mockUser:           nil,
			mockError:          nil,
			expectedStatusCode: 404,
			expectedBody:       `{"error":"User not found"}`,
		},
		{
			name:               "Database Error",
			request:            requestWithSub("user123"),
			mockUser:           nil,
			mockError:          errors.New("database error"),
			expectedStatusCode: 500,
			expectedBody:       `{"error":"Failed to retrieve user"}`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockGetUserFn := func(_ dynamodbiface.DynamoDBAPI, _ string) (*models.User, error) {
				return tc.mockUser, tc.mockError
			}

			handlerFn := handlerWithDeps(mockGetUserFn)

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
