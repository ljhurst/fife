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

func requestWithSub(sub, body string) events.APIGatewayV2HTTPRequest {
	request := events.APIGatewayV2HTTPRequest{Body: body}
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
			request: requestWithSub("user123", `{"finance":{"annualSalary":120000,"paychecksPerYear":24}}`),
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
			name:               "Missing Subject",
			request:            requestWithSub("", `{"finance":{"annualSalary":120000,"paychecksPerYear":24}}`),
			mockUser:           nil,
			mockError:          nil,
			expectedStatusCode: 401,
			expectedBody:       `{"error":"Unauthorized"}`,
		},
		{
			name:               "Invalid Request Body",
			request:            requestWithSub("user123", `{invalid json}`),
			mockUser:           nil,
			mockError:          nil,
			expectedStatusCode: 400,
			expectedBody:       `{"error":"Invalid request body"}`,
		},
		{
			name:               "Database Error",
			request:            requestWithSub("user123", `{"finance":{"annualSalary":120000,"paychecksPerYear":24}}`),
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
