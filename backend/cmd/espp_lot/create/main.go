package main

import (
	"context"
	"encoding/json"
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

type createEsppLotFunc func(svc dynamodbiface.DynamoDBAPI, lot models.EsppLotInput) (*models.EsppLot, error)

func handlerWithDeps(createEsppLotFn createEsppLotFunc) func(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	return func(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
		userID, err := auth.Subject(request)
		if err != nil {
			return utils.UnauthorizedError()
		}

		var lot models.EsppLotInput
		if err := json.Unmarshal([]byte(request.Body), &lot); err != nil {
			return utils.InvalidRequestBodyError()
		}
		lot.UserID = userID

		sess := session.Must(session.NewSession())
		svc := dynamodb.New(sess, aws.NewConfig().WithRegion(os.Getenv("AWS_REGION")))

		createdLot, err := createEsppLotFn(svc, lot)
		if err != nil {
			return utils.APIResponse(500, map[string]string{"error": "Failed to create ESPP lot"})
		}

		return utils.APIResponse(201, createdLot)
	}
}

func handler(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	handlerWithInjectedDeps := handlerWithDeps(db.CreateEsppLot)
	return handlerWithInjectedDeps(ctx, request)
}

func main() {
	lambda.Start(handler)
}
