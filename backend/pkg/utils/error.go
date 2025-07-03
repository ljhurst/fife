package utils

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
)

func MissingPathParameterError(paramName string) (events.APIGatewayProxyResponse, error) {
	return APIResponse(400, map[string]string{
		"error": fmt.Sprintf("Missing path parameter: %s", paramName),
	})
}

func InvalidRequestBodyError() (events.APIGatewayProxyResponse, error) {
	return APIResponse(400, map[string]string{
		"error": "Invalid request body",
	})
}
