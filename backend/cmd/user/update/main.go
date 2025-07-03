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

	"github.com/ljhurst/fife/pkg/constants"
	"github.com/ljhurst/fife/pkg/db"
	"github.com/ljhurst/fife/pkg/models"
	"github.com/ljhurst/fife/pkg/utils"
)

type updateUserSettingsFunc func(svc dynamodbiface.DynamoDBAPI, userID string, settings models.UserSettings) (*models.User, error)

func handlerWithDeps(updateUserSettingsFn updateUserSettingsFunc) func(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return func(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		userID := request.PathParameters[constants.PathUserID]
		if userID == "" {
			return utils.MissingPathParameterError(constants.PathUserID)
		}

		var userSettings models.UserSettings
		if err := json.Unmarshal([]byte(request.Body), &userSettings); err != nil {
			return utils.InvalidRequestBodyError()
		}

		sess := session.Must(session.NewSession())
		svc := dynamodb.New(sess, aws.NewConfig().WithRegion(os.Getenv("AWS_REGION")))

		updatedUser, err := updateUserSettingsFn(svc, userID, userSettings)
		if err != nil {
			return utils.APIResponse(500, map[string]string{"error": "Failed to update user settings"})
		}

		return utils.APIResponse(200, updatedUser)
	}
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	handlerWithInjectedDeps := handlerWithDeps(db.UpdateUserSettings)
	return handlerWithInjectedDeps(ctx, request)
}

func main() {
	lambda.Start(handler)
}
