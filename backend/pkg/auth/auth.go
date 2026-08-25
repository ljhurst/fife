package auth

import (
	"errors"

	"github.com/aws/aws-lambda-go/events"
)

var ErrMissingSubject = errors.New("missing sub claim")

// Subject returns the verified user id from the JWT `sub` claim that API
// Gateway's JWT authorizer attaches to the request context.
func Subject(request events.APIGatewayV2HTTPRequest) (string, error) {
	authorizer := request.RequestContext.Authorizer
	if authorizer == nil || authorizer.JWT == nil {
		return "", ErrMissingSubject
	}

	sub, ok := authorizer.JWT.Claims["sub"]
	if !ok || sub == "" {
		return "", ErrMissingSubject
	}

	return sub, nil
}
