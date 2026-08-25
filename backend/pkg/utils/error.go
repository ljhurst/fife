package utils

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
)

func MissingPathParameterError(paramName string) (events.APIGatewayV2HTTPResponse, error) {
	return APIResponse(400, map[string]string{
		"error": fmt.Sprintf("Missing path parameter: %s", paramName),
	})
}

func InvalidRequestBodyError() (events.APIGatewayV2HTTPResponse, error) {
	return APIResponse(400, map[string]string{
		"error": "Invalid request body",
	})
}

func UnauthorizedError() (events.APIGatewayV2HTTPResponse, error) {
	return APIResponse(401, map[string]string{
		"error": "Unauthorized",
	})
}

func ForbiddenError() (events.APIGatewayV2HTTPResponse, error) {
	return APIResponse(403, map[string]string{
		"error": "Forbidden",
	})
}
