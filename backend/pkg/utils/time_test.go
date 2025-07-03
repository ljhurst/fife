package utils

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestGetCurrentTimeUTC(t *testing.T) {
	timeStr := GetCurrentTimeUTC()

	parsedTime, err := time.Parse(time.RFC3339, timeStr)
	assert.NoError(t, err, "Time string should be in RFC3339 format")

	assert.Equal(t, "UTC", parsedTime.Location().String(), "Time should be in UTC")

	now := time.Now().UTC()
	diff := now.Sub(parsedTime)
	assert.LessOrEqual(t, diff.Seconds(), 2.0, "Time should be close to current time")
}
