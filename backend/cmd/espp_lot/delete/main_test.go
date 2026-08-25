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

func requestWithSub(sub string, pathParameters map[string]string) events.APIGatewayV2HTTPRequest {
	request := events.APIGatewayV2HTTPRequest{PathParameters: pathParameters}
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
		mockLot            *models.EsppLot
		mockGetError       error
		mockDeleteError    error
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "successful deletion",
			request:            requestWithSub("user123", map[string]string{"lotId": "lot123"}),
			mockLot:            &models.EsppLot{ID: "lot123", UserID: "user123"},
			expectedStatusCode: 200,
			expectedBody:       `{"message":"ESPP lot deleted successfully"}`,
		},
		{
			name:               "missing lot ID",
			request:            requestWithSub("user123", map[string]string{}),
			expectedStatusCode: 400,
			expectedBody:       `{"error":"Missing path parameter: lotId"}`,
		},
		{
			name:               "missing subject",
			request:            requestWithSub("", map[string]string{"lotId": "lot123"}),
			expectedStatusCode: 401,
			expectedBody:       `{"error":"Unauthorized"}`,
		},
		{
			name:               "lot not found",
			request:            requestWithSub("user123", map[string]string{"lotId": "nonexistent"}),
			mockLot:            nil,
			expectedStatusCode: 404,
			expectedBody:       `{"error":"ESPP lot not found"}`,
		},
		{
			name:               "lot owned by another user",
			request:            requestWithSub("user123", map[string]string{"lotId": "lot123"}),
			mockLot:            &models.EsppLot{ID: "lot123", UserID: "someone-else"},
			expectedStatusCode: 403,
			expectedBody:       `{"error":"Forbidden"}`,
		},
		{
			name:               "get error",
			request:            requestWithSub("user123", map[string]string{"lotId": "lot123"}),
			mockGetError:       errors.New("database error"),
			expectedStatusCode: 500,
			expectedBody:       `{"error":"Failed to delete ESPP lot"}`,
		},
		{
			name:               "delete error",
			request:            requestWithSub("user123", map[string]string{"lotId": "lot123"}),
			mockLot:            &models.EsppLot{ID: "lot123", UserID: "user123"},
			mockDeleteError:    errors.New("database error"),
			expectedStatusCode: 500,
			expectedBody:       `{"error":"Failed to delete ESPP lot"}`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockGetEsppLot := func(svc dynamodbiface.DynamoDBAPI, id string) (*models.EsppLot, error) {
				return tc.mockLot, tc.mockGetError
			}
			mockDeleteEsppLot := func(svc dynamodbiface.DynamoDBAPI, id string) error {
				return tc.mockDeleteError
			}

			handler := handlerWithDeps(mockGetEsppLot, mockDeleteEsppLot)
			response, err := handler(context.Background(), tc.request)

			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, response.StatusCode)
			assert.Equal(t, tc.expectedBody, response.Body)
		})
	}
}
