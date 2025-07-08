package main

import (
	"context"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"

	"github.com/ljhurst/fife/pkg/constants"
	"github.com/ljhurst/fife/pkg/db"
	"github.com/ljhurst/fife/pkg/utils"
)

type deleteEsppLotFunc func(svc dynamodbiface.DynamoDBAPI, id string) error

func handlerWithDeps(deleteEsppLotFn deleteEsppLotFunc) func(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return func(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		lotID := request.PathParameters[constants.PathLotID]
		if lotID == "" {
			return utils.MissingPathParameterError(constants.PathLotID)
		}

		sess := session.Must(session.NewSession())
		svc := dynamodb.New(sess, aws.NewConfig().WithRegion(os.Getenv("AWS_REGION")))

		err := deleteEsppLotFn(svc, lotID)
		if err != nil {
			return utils.APIResponse(500, map[string]string{"error": "Failed to delete ESPP lot"})
		}

		return utils.APIResponse(200, map[string]string{"message": "ESPP lot deleted successfully"})
	}
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	handlerWithInjectedDeps := handlerWithDeps(db.DeleteEsppLot)
	return handlerWithInjectedDeps(ctx, request)
}

func main() {
	lambda.Start(handler)
}
