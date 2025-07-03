package db

import (
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"github.com/aws/aws-sdk-go/service/dynamodb/expression"
	"github.com/ljhurst/fife/pkg/models"
)

const (
	TableName = "fife-users"
)

func GetUser(svc dynamodbiface.DynamoDBAPI, userID string) (*models.User, error) {
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

func UpdateUserSettings(svc dynamodbiface.DynamoDBAPI, userID string, settings models.UserSettings) (*models.User, error) {
	currentTime := time.Now().UTC().Format(time.RFC3339)

	update := expression.Set(expression.Name("settings"), expression.Value(settings))
	update = update.Set(expression.Name("updatedAt"), expression.Value(currentTime))

	expr, err := expression.NewBuilder().WithUpdate(update).Build()
	if err != nil {
		return nil, err
	}

	input := &dynamodb.UpdateItemInput{
		TableName: aws.String(TableName),
		Key: map[string]*dynamodb.AttributeValue{
			"userId": {
				S: aws.String(userID),
			},
		},
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		UpdateExpression:          expr.Update(),
		ReturnValues:              aws.String("ALL_NEW"),
	}

	result, err := svc.UpdateItem(input)
	if err != nil {
		return nil, err
	}

	updatedUser := &models.User{}
	err = dynamodbattribute.UnmarshalMap(result.Attributes, updatedUser)
	if err != nil {
		return nil, err
	}

	return updatedUser, nil
}
