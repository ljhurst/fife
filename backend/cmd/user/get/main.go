package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"

	"github.com/ljhurst/fife/pkg/constants"
	"github.com/ljhurst/fife/pkg/db"
	"github.com/ljhurst/fife/pkg/utils"
)

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	userID := request.PathParameters[constants.PathUserID]
	if userID == "" {
		return utils.APIResponse(400, map[string]string{"error": fmt.Sprintf("Missing path parameter: %s", constants.PathUserID)})
	}

	sess := session.Must(session.NewSession())
	svc := dynamodb.New(sess, aws.NewConfig().WithRegion(os.Getenv("AWS_REGION")))

	user, err := db.GetUser(svc, userID)
	if err != nil {
		return utils.APIResponse(500, map[string]string{"error": "Failed to retrieve user"})
	}

	if user == nil {
		return utils.APIResponse(404, map[string]string{"error": "User not found"})
	}

	return utils.APIResponse(200, user)
}

func main() {
	lambda.Start(handler)
}
