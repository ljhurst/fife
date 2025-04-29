package models

type UserFinanceSettings struct {
	AnnualSalary     float64 `json:"annualSalary" dynamodbav:"annualSalary"`
	PaychecksPerYear int     `json:"paychecksPerYear" dynamodbav:"paychecksPerYear"`
}

type UserSettings struct {
	Finance UserFinanceSettings `json:"finance" dynamodbav:"finance"`
}

type User struct {
	UserID    string       `json:"userId" dynamodbav:"userId"`
	Settings  UserSettings `json:"settings" dynamodbav:"settings"`
	CreatedAt string       `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt string       `json:"updatedAt" dynamodbav:"updatedAt"`
}
