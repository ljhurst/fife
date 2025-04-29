package db

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/ljhurst/fife/pkg/models"
)

const (
	TableName = "fife-users"
)

func GetUser(svc *dynamodb.DynamoDB, userID string) (*models.User, error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String(TableName),
		Key: map[string]*dynamodb.AttributeValue{
			"userId": {
				S: aws.String(userID),
			},
		},
	}

	result, err := svc.GetItem(input)
	if err != nil {
		return nil, err
	}

	if result.Item == nil {
		return nil, nil
	}

	user := &models.User{}
	err = dynamodbattribute.UnmarshalMap(result.Item, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}
