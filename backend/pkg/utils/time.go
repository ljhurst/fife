package utils

import (
	"time"
)

func GetCurrentTimeUTC() string {
	return time.Now().UTC().Format(time.RFC3339)
}
