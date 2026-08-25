package auth

import (
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/stretchr/testify/assert"
)

func TestSubject(t *testing.T) {
	testCases := []struct {
		name        string
		request     events.APIGatewayV2HTTPRequest
		expectedSub string
		expectedErr error
	}{
		{
			name: "valid subject",
			request: events.APIGatewayV2HTTPRequest{
				RequestContext: events.APIGatewayV2HTTPRequestContext{
					Authorizer: &events.APIGatewayV2HTTPRequestContextAuthorizerDescription{
						JWT: &events.APIGatewayV2HTTPRequestContextAuthorizerJWTDescription{
							Claims: map[string]string{"sub": "user123"},
						},
					},
				},
			},
			expectedSub: "user123",
		},
		{
			name:        "no authorizer",
			request:     events.APIGatewayV2HTTPRequest{},
			expectedErr: ErrMissingSubject,
		},
		{
			name: "no jwt on authorizer",
			request: events.APIGatewayV2HTTPRequest{
				RequestContext: events.APIGatewayV2HTTPRequestContext{
					Authorizer: &events.APIGatewayV2HTTPRequestContextAuthorizerDescription{},
				},
			},
			expectedErr: ErrMissingSubject,
		},
		{
			name: "no sub claim",
			request: events.APIGatewayV2HTTPRequest{
				RequestContext: events.APIGatewayV2HTTPRequestContext{
					Authorizer: &events.APIGatewayV2HTTPRequestContextAuthorizerDescription{
						JWT: &events.APIGatewayV2HTTPRequestContextAuthorizerJWTDescription{
							Claims: map[string]string{},
						},
					},
				},
			},
			expectedErr: ErrMissingSubject,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			sub, err := Subject(tc.request)

			assert.Equal(t, tc.expectedSub, sub)
			assert.Equal(t, tc.expectedErr, err)
		})
	}
}
