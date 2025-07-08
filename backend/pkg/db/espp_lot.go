package db

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"github.com/ljhurst/fife/pkg/models"
)

const (
	EsppLotsTableName = "fife-espp-lots"
)

func CreateEsppLot(svc dynamodbiface.DynamoDBAPI, lotInput models.EsppLotInput) (*models.EsppLot, error) {
	lot := models.NewEsppLot(lotInput)

	av, err := dynamodbattribute.MarshalMap(lot)
	if err != nil {
		return nil, err
	}

	input := &dynamodb.PutItemInput{
		TableName: aws.String(EsppLotsTableName),
		Item:      av,
	}

	_, err = svc.PutItem(input)
	if err != nil {
		return nil, err
	}

	return lot, nil
}

func GetEsppLot(svc dynamodbiface.DynamoDBAPI, id string) (*models.EsppLot, error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String(EsppLotsTableName),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				S: aws.String(id),
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

	lot := &models.EsppLot{}
	err = dynamodbattribute.UnmarshalMap(result.Item, lot)
	if err != nil {
		return nil, err
	}

	return lot, nil
}

func GetEsppLotsByUserID(svc dynamodbiface.DynamoDBAPI, userID string) ([]*models.EsppLot, error) {
	input := &dynamodb.QueryInput{
		TableName: aws.String(EsppLotsTableName),
		IndexName: aws.String("userId-index"),
		KeyConditions: map[string]*dynamodb.Condition{
			"userId": {
				ComparisonOperator: aws.String("EQ"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						S: aws.String(userID),
					},
				},
			},
		},
	}

	result, err := svc.Query(input)
	if err != nil {
		return nil, err
	}

	lots := []*models.EsppLot{}
	err = dynamodbattribute.UnmarshalListOfMaps(result.Items, &lots)
	if err != nil {
		return nil, err
	}

	return lots, nil
}

func DeleteEsppLot(svc dynamodbiface.DynamoDBAPI, id string) error {
	input := &dynamodb.DeleteItemInput{
		TableName: aws.String(EsppLotsTableName),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				S: aws.String(id),
			},
		},
	}

	_, err := svc.DeleteItem(input)
	return err
}
