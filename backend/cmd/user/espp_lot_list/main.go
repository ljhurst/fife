package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"

	"github.com/ljhurst/fife/pkg/auth"
	"github.com/ljhurst/fife/pkg/db"
	"github.com/ljhurst/fife/pkg/models"
	"github.com/ljhurst/fife/pkg/utils"
)

type getEsppLotsByUserIDFunc func(svc dynamodbiface.DynamoDBAPI, userID string) ([]*models.EsppLot, error)

func handlerWithDeps(getEsppLotsByUserIDFn getEsppLotsByUserIDFunc) func(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	return func(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
		userID, err := auth.Subject(request)
		if err != nil {
			return utils.UnauthorizedError()
		}

		sess := session.Must(session.NewSession())
		svc := dynamodb.New(sess, aws.NewConfig().WithRegion(os.Getenv("AWS_REGION")))

		lots, err := getEsppLotsByUserIDFn(svc, userID)
		if err != nil {
			slog.Error("Failed to retrieve ESPP lots", slog.Any("error", err))
			return utils.APIResponse(500, map[string]string{"error": "Failed to retrieve ESPP lots"})
		}

		return utils.APIResponse(200, lots)
	}
}

func handler(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	handlerWithInjectedDeps := handlerWithDeps(db.GetEsppLotsByUserID)
	return handlerWithInjectedDeps(ctx, request)
}

func main() {
	lambda.Start(handler)
}
