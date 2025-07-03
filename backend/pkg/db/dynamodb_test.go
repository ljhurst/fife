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

type mockDynamoDBClient struct {
	dynamodbiface.DynamoDBAPI
	getItemOutput    *dynamodb.GetItemOutput
	getItemError     error
	updateItemOutput *dynamodb.UpdateItemOutput
	updateItemError  error
}

func (m *mockDynamoDBClient) GetItem(input *dynamodb.GetItemInput) (*dynamodb.GetItemOutput, error) {
	if *input.TableName != TableName {
		return nil, errors.New("incorrect table name")
	}

	userID, ok := input.Key["userId"]
	if !ok || userID.S == nil {
		return nil, errors.New("missing or invalid userId key")
	}

	return m.getItemOutput, m.getItemError
}

func (m *mockDynamoDBClient) UpdateItem(input *dynamodb.UpdateItemInput) (*dynamodb.UpdateItemOutput, error) {
	if *input.TableName != TableName {
		return nil, errors.New("incorrect table name")
	}

	userID, ok := input.Key["userId"]
	if !ok || userID.S == nil {
		return nil, errors.New("missing or invalid userId key")
	}

	return m.updateItemOutput, m.updateItemError
}

func TestGetUser(t *testing.T) {
	testCases := []struct {
		name          string
		userID        string
		mockOutput    *dynamodb.GetItemOutput
		mockError     error
		expectedUser  *models.User
		expectedError bool
	}{
		{
			name:   "Success",
			userID: "user123",
			mockOutput: &dynamodb.GetItemOutput{
				Item: map[string]*dynamodb.AttributeValue{
					"userId": {S: aws.String("user123")},
					"settings": {M: map[string]*dynamodb.AttributeValue{
						"finance": {M: map[string]*dynamodb.AttributeValue{
							"annualSalary":     {N: aws.String("100000")},
							"paychecksPerYear": {N: aws.String("26")},
						}},
					}},
					"createdAt": {S: aws.String("2023-01-01T00:00:00Z")},
					"updatedAt": {S: aws.String("2023-01-02T00:00:00Z")},
				},
			},
			mockError: nil,
			expectedUser: &models.User{
				UserID: "user123",
				Settings: models.UserSettings{
					Finance: models.UserFinanceSettings{
						AnnualSalary:     100000,
						PaychecksPerYear: 26,
					},
				},
				CreatedAt: "2023-01-01T00:00:00Z",
				UpdatedAt: "2023-01-02T00:00:00Z",
			},
			expectedError: false,
		},
		{
			name:          "User Not Found",
			userID:        "nonexistent",
			mockOutput:    &dynamodb.GetItemOutput{Item: nil},
			mockError:     nil,
			expectedUser:  nil,
			expectedError: false,
		},
		{
			name:          "DynamoDB Error",
			userID:        "user123",
			mockOutput:    nil,
			mockError:     errors.New("dynamodb error"),
			expectedUser:  nil,
			expectedError: true,
		},
		{
			name:   "Unmarshal Error",
			userID: "user123",
			mockOutput: &dynamodb.GetItemOutput{
				Item: map[string]*dynamodb.AttributeValue{
					"userId": {S: aws.String("user123")},
					"settings": {M: map[string]*dynamodb.AttributeValue{
						"finance": {M: map[string]*dynamodb.AttributeValue{
							"annualSalary":     {N: aws.String("100000")},
							"paychecksPerYear": {S: aws.String("invalid")},
						}},
					}},
				},
			},
			mockError:     nil,
			expectedUser:  nil,
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockSvc := &mockDynamoDBClient{
				getItemOutput: tc.mockOutput,
				getItemError:  tc.mockError,
			}

			user, err := GetUser(mockSvc, tc.userID)

			if tc.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.Equal(t, tc.expectedUser, user)
		})
	}
}

func TestUpdateUserSettings(t *testing.T) {
	testCases := []struct {
		name          string
		userID        string
		settings      models.UserSettings
		mockOutput    *dynamodb.UpdateItemOutput
		mockError     error
		expectedUser  *models.User
		expectedError bool
	}{
		{
			name:   "Success",
			userID: "user123",
			settings: models.UserSettings{
				Finance: models.UserFinanceSettings{
					AnnualSalary:     120000,
					PaychecksPerYear: 24,
				},
			},
			mockOutput: &dynamodb.UpdateItemOutput{
				Attributes: map[string]*dynamodb.AttributeValue{
					"userId": {S: aws.String("user123")},
					"settings": {M: map[string]*dynamodb.AttributeValue{
						"finance": {M: map[string]*dynamodb.AttributeValue{
							"annualSalary":     {N: aws.String("120000")},
							"paychecksPerYear": {N: aws.String("24")},
						}},
					}},
					"createdAt": {S: aws.String("2023-01-01T00:00:00Z")},
					"updatedAt": {S: aws.String("2023-07-03T12:00:00Z")},
				},
			},
			mockError: nil,
			expectedUser: &models.User{
				UserID: "user123",
				Settings: models.UserSettings{
					Finance: models.UserFinanceSettings{
						AnnualSalary:     120000,
						PaychecksPerYear: 24,
					},
				},
				CreatedAt: "2023-01-01T00:00:00Z",
				UpdatedAt: "2023-07-03T12:00:00Z",
			},
			expectedError: false,
		},
		{
			name:   "DynamoDB Error",
			userID: "user123",
			settings: models.UserSettings{
				Finance: models.UserFinanceSettings{
					AnnualSalary:     120000,
					PaychecksPerYear: 24,
				},
			},
			mockOutput:    nil,
			mockError:     errors.New("dynamodb error"),
			expectedUser:  nil,
			expectedError: true,
		},
		{
			name:   "Unmarshal Error",
			userID: "user123",
			settings: models.UserSettings{
				Finance: models.UserFinanceSettings{
					AnnualSalary:     120000,
					PaychecksPerYear: 24,
				},
			},
			mockOutput: &dynamodb.UpdateItemOutput{
				Attributes: map[string]*dynamodb.AttributeValue{
					"userId": {S: aws.String("user123")},
					"settings": {M: map[string]*dynamodb.AttributeValue{
						"finance": {M: map[string]*dynamodb.AttributeValue{
							"annualSalary":     {N: aws.String("120000")},
							"paychecksPerYear": {S: aws.String("invalid")},
						}},
					}},
				},
			},
			mockError:     nil,
			expectedUser:  nil,
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			mockSvc := &mockDynamoDBClient{
				updateItemOutput: tc.mockOutput,
				updateItemError:  tc.mockError,
			}

			user, err := UpdateUserSettings(mockSvc, tc.userID, tc.settings)

			if tc.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.Equal(t, tc.expectedUser, user)
		})
	}
}
