package main

import (
	"context"
	"errors"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"github.com/stretchr/testify/assert"
)

func TestHandler(t *testing.T) {
	testCases := []struct {
		name               string
		request            events.APIGatewayProxyRequest
		mockError          error
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name: "successful deletion",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"lotId": "lot123",
				},
			},
			mockError:          nil,
			expectedStatusCode: 200,
			expectedBody:       `{"message":"ESPP lot deleted successfully"}`,
		},
		{
			name: "missing lot ID",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{},
			},
			mockError:          nil,
			expectedStatusCode: 400,
			expectedBody:       `{"error":"Missing path parameter: lotId"}`,
		},
		{
			name: "database error",
			request: events.APIGatewayProxyRequest{
				PathParameters: map[string]string{
					"lotId": "lot123",
				},
			},
			mockError:          errors.New("database error"),
			expectedStatusCode: 500,
			expectedBody:       `{"error":"Failed to delete ESPP lot"}`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockDeleteEsppLot := func(svc dynamodbiface.DynamoDBAPI, id string) error {
				return tc.mockError
			}

			handler := handlerWithDeps(mockDeleteEsppLot)
			response, err := handler(context.Background(), tc.request)

			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, response.StatusCode)
			assert.Equal(t, tc.expectedBody, response.Body)
		})
	}
}
