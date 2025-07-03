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

	"github.com/ljhurst/fife/pkg/constants"
	"github.com/ljhurst/fife/pkg/db"
	"github.com/ljhurst/fife/pkg/models"
	"github.com/ljhurst/fife/pkg/utils"
)

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
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

	updatedUser, err := db.UpdateUserSettings(svc, userID, userSettings)

	if err != nil {
		return utils.APIResponse(500, map[string]string{"error": "Failed to update user settings"})
	}

	return utils.APIResponse(200, updatedUser)
}

func main() {
	lambda.Start(handler)
}
