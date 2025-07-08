package db

import (
	"errors"
	"testing"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
	"github.com/ljhurst/fife/pkg/models"
	"github.com/stretchr/testify/assert"
)

type mockEsppDynamoDBClient struct {
	dynamodbiface.DynamoDBAPI
	getItemOutput    *dynamodb.GetItemOutput
	getItemError     error
	putItemOutput    *dynamodb.PutItemOutput
	putItemError     error
	queryOutput      *dynamodb.QueryOutput
	queryError       error
	deleteItemOutput *dynamodb.DeleteItemOutput
	deleteItemError  error
}

func (m *mockEsppDynamoDBClient) GetItem(input *dynamodb.GetItemInput) (*dynamodb.GetItemOutput, error) {
	if *input.TableName != EsppLotsTableName {
		return nil, errors.New("incorrect table name")
	}

	id, ok := input.Key["id"]
	if !ok || id.S == nil {
		return nil, errors.New("missing or invalid id key")
	}

	return m.getItemOutput, m.getItemError
}

func (m *mockEsppDynamoDBClient) PutItem(input *dynamodb.PutItemInput) (*dynamodb.PutItemOutput, error) {
	if *input.TableName != EsppLotsTableName {
		return nil, errors.New("incorrect table name")
	}

	return m.putItemOutput, m.putItemError
}

func (m *mockEsppDynamoDBClient) Query(input *dynamodb.QueryInput) (*dynamodb.QueryOutput, error) {
	if *input.TableName != EsppLotsTableName {
		return nil, errors.New("incorrect table name")
	}

	userID, ok := input.KeyConditions["userId"]
	if !ok || userID.AttributeValueList[0].S == nil {
		return nil, errors.New("missing or invalid userId key condition")
	}

	return m.queryOutput, m.queryError
}

func (m *mockEsppDynamoDBClient) DeleteItem(input *dynamodb.DeleteItemInput) (*dynamodb.DeleteItemOutput, error) {
	if *input.TableName != EsppLotsTableName {
		return nil, errors.New("incorrect table name")
	}

	id, ok := input.Key["id"]
	if !ok || id.S == nil {
		return nil, errors.New("missing or invalid id key")
	}

	return m.deleteItemOutput, m.deleteItemError
}

func TestCreateEsppLot(t *testing.T) {
	testCases := []struct {
		name          string
		lot           models.EsppLotInput
		mockOutput    *dynamodb.PutItemOutput
		mockError     error
		expectedLot   *models.EsppLot
		expectedError bool
	}{
		{
			name: "successful creation",
			lot: models.EsppLotInput{
				UserID:          "user123",
				GrantDate:       "2023-01-01",
				PurchaseDate:    "2023-06-30",
				OfferStartPrice: 100.0,
				OfferEndPrice:   120.0,
				PurchasePrice:   85.0,
				Shares:          10.0,
			},
			mockOutput: &dynamodb.PutItemOutput{},
			mockError:  nil,
			expectedLot: &models.EsppLot{
				ID:              "generated-id",
				UserID:          "user123",
				GrantDate:       "2023-01-01",
				PurchaseDate:    "2023-06-30",
				OfferStartPrice: 100.0,
				OfferEndPrice:   120.0,
				PurchasePrice:   85.0,
				Shares:          10.0,
				CreatedAt:       "generated-time",
				UpdatedAt:       "generated-time",
			},
			expectedError: false,
		},
		{
			name: "dynamodb error",
			lot: models.EsppLotInput{
				UserID:          "user123",
				GrantDate:       "2023-01-01",
				PurchaseDate:    "2023-06-30",
				OfferStartPrice: 100.0,
				OfferEndPrice:   120.0,
				PurchasePrice:   85.0,
				Shares:          10.0,
			},
			mockOutput:    nil,
			mockError:     errors.New("dynamodb error"),
			expectedLot:   nil,
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockSvc := &mockEsppDynamoDBClient{
				putItemOutput: tc.mockOutput,
				putItemError:  tc.mockError,
			}

			lot, err := CreateEsppLot(mockSvc, tc.lot)

			if tc.expectedError {
				assert.Error(t, err)
				assert.Nil(t, lot)
			} else {
				assert.NoError(t, err)

				assert.NotNil(t, lot)
				assert.Equal(t, tc.expectedLot.UserID, lot.UserID)
				assert.Equal(t, tc.expectedLot.GrantDate, lot.GrantDate)
				assert.Equal(t, tc.expectedLot.PurchaseDate, lot.PurchaseDate)
				assert.Equal(t, tc.expectedLot.OfferStartPrice, lot.OfferStartPrice)
				assert.Equal(t, tc.expectedLot.OfferEndPrice, lot.OfferEndPrice)
				assert.Equal(t, tc.expectedLot.PurchasePrice, lot.PurchasePrice)
				assert.Equal(t, tc.expectedLot.Shares, lot.Shares)
				assert.NotEmpty(t, lot.ID)
				assert.NotEmpty(t, lot.CreatedAt)
				assert.NotEmpty(t, lot.UpdatedAt)

			}
		})
	}
}

func TestGetEsppLot(t *testing.T) {
	testCases := []struct {
		name          string
		id            string
		userID        string
		mockOutput    *dynamodb.GetItemOutput
		mockError     error
		expectedLot   *models.EsppLot
		expectedError bool
	}{
		{
			name:   "successful retrieval",
			id:     "lot123",
			userID: "user123",
			mockOutput: &dynamodb.GetItemOutput{
				Item: map[string]*dynamodb.AttributeValue{
					"id": {
						S: aws.String("lot123"),
					},
					"userId": {
						S: aws.String("user123"),
					},
					"grantDate": {
						S: aws.String("2023-01-01"),
					},
					"purchaseDate": {
						S: aws.String("2023-06-30"),
					},
					"offerStartPrice": {
						N: aws.String("100"),
					},
					"offerEndPrice": {
						N: aws.String("120"),
					},
					"purchasePrice": {
						N: aws.String("85"),
					},
					"shares": {
						N: aws.String("10"),
					},
				},
			},
			mockError: nil,
			expectedLot: &models.EsppLot{
				ID:              "lot123",
				UserID:          "user123",
				GrantDate:       "2023-01-01",
				PurchaseDate:    "2023-06-30",
				OfferStartPrice: 100.0,
				OfferEndPrice:   120.0,
				PurchasePrice:   85.0,
				Shares:          10.0,
			},
			expectedError: false,
		},
		{
			name:          "lot not found",
			id:            "lot456",
			userID:        "user123",
			mockOutput:    &dynamodb.GetItemOutput{},
			mockError:     nil,
			expectedLot:   nil,
			expectedError: false,
		},
		{
			name:          "dynamodb error",
			id:            "lot123",
			userID:        "user123",
			mockOutput:    nil,
			mockError:     errors.New("dynamodb error"),
			expectedLot:   nil,
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockSvc := &mockEsppDynamoDBClient{
				getItemOutput: tc.mockOutput,
				getItemError:  tc.mockError,
			}

			lot, err := GetEsppLot(mockSvc, tc.id)

			if tc.expectedError {
				assert.Error(t, err)
				assert.Nil(t, lot)
			} else if tc.expectedLot == nil {
				assert.NoError(t, err)
				assert.Nil(t, lot)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.expectedLot, lot)
			}
		})
	}
}

func TestGetEsppLotsByUserID(t *testing.T) {
	testCases := []struct {
		name          string
		userID        string
		mockOutput    *dynamodb.QueryOutput
		mockError     error
		expectedLots  []*models.EsppLot
		expectedError bool
	}{
		{
			name:   "successful retrieval",
			userID: "user123",
			mockOutput: &dynamodb.QueryOutput{
				Items: []map[string]*dynamodb.AttributeValue{
					{
						"id": {
							S: aws.String("lot123"),
						},
						"userId": {
							S: aws.String("user123"),
						},
						"grantDate": {
							S: aws.String("2023-01-01"),
						},
						"purchaseDate": {
							S: aws.String("2023-06-30"),
						},
						"offerStartPrice": {
							N: aws.String("100"),
						},
						"offerEndPrice": {
							N: aws.String("120"),
						},
						"purchasePrice": {
							N: aws.String("85"),
						},
						"shares": {
							N: aws.String("10"),
						},
					},
					{
						"id": {
							S: aws.String("lot456"),
						},
						"userId": {
							S: aws.String("user123"),
						},
						"grantDate": {
							S: aws.String("2023-07-01"),
						},
						"purchaseDate": {
							S: aws.String("2023-12-31"),
						},
						"offerStartPrice": {
							N: aws.String("120"),
						},
						"offerEndPrice": {
							N: aws.String("140"),
						},
						"purchasePrice": {
							N: aws.String("95"),
						},
						"shares": {
							N: aws.String("15"),
						},
					},
				},
			},
			mockError: nil,
			expectedLots: []*models.EsppLot{
				{
					ID:              "lot123",
					UserID:          "user123",
					GrantDate:       "2023-01-01",
					PurchaseDate:    "2023-06-30",
					OfferStartPrice: 100.0,
					OfferEndPrice:   120.0,
					PurchasePrice:   85.0,
					Shares:          10.0,
				},
				{
					ID:              "lot456",
					UserID:          "user123",
					GrantDate:       "2023-07-01",
					PurchaseDate:    "2023-12-31",
					OfferStartPrice: 120.0,
					OfferEndPrice:   140.0,
					PurchasePrice:   95.0,
					Shares:          15.0,
				},
			},
			expectedError: false,
		},
		{
			name:          "no lots found",
			userID:        "user456",
			mockOutput:    &dynamodb.QueryOutput{Items: []map[string]*dynamodb.AttributeValue{}},
			mockError:     nil,
			expectedLots:  []*models.EsppLot{},
			expectedError: false,
		},
		{
			name:          "dynamodb error",
			userID:        "user123",
			mockOutput:    nil,
			mockError:     errors.New("dynamodb error"),
			expectedLots:  nil,
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockSvc := &mockEsppDynamoDBClient{
				queryOutput: tc.mockOutput,
				queryError:  tc.mockError,
			}

			lots, err := GetEsppLotsByUserID(mockSvc, tc.userID)

			if tc.expectedError {
				assert.Error(t, err)
				assert.Nil(t, lots)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.expectedLots, lots)
			}
		})
	}
}

func TestDeleteEsppLot(t *testing.T) {
	testCases := []struct {
		name          string
		id            string
		mockOutput    *dynamodb.DeleteItemOutput
		mockError     error
		expectedError bool
	}{
		{
			name:          "successful deletion",
			id:            "lot123",
			mockOutput:    &dynamodb.DeleteItemOutput{},
			mockError:     nil,
			expectedError: false,
		},
		{
			name:          "dynamodb error",
			id:            "lot123",
			mockOutput:    nil,
			mockError:     errors.New("dynamodb error"),
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockSvc := &mockEsppDynamoDBClient{
				deleteItemOutput: tc.mockOutput,
				deleteItemError:  tc.mockError,
			}

			err := DeleteEsppLot(mockSvc, tc.id)

			if tc.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
