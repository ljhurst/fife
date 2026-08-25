package utils

import (
	"encoding/json"
	"github.com/aws/aws-lambda-go/events"
)

func APIResponse(statusCode int, body interface{}) (events.APIGatewayV2HTTPResponse, error) {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return events.APIGatewayV2HTTPResponse{}, err
	}

	return events.APIGatewayV2HTTPResponse{
		StatusCode: statusCode,
		Body:       string(jsonBody),
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}, nil
}
