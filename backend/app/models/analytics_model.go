package models

import (
	"time"

	db "github.com/yorukot/zipt/pkg/database"
)

func init() {
	// Only auto-migrate URLMetric, removing the old tables
	db.GetDB().AutoMigrate(&URLAnalytics{})
	db.GetDB().AutoMigrate(&URLAnalyticsHourly{})
	db.GetDB().AutoMigrate(&URLAnalyticsDaily{})
	db.GetDB().AutoMigrate(&URLAnalyticsMonthly{})

	// Enable TimescaleDB for analytics if available
	if db.IsTimescaleEnabled {
		db.InitializeTimescale()
	}
}

// ==================================================
// Analytics time granularities:
// - 2 mins record for 12 hours
// - 1 hour record for 14 days
// - 1 day record for 365 days
// - 1 month record for 100 years
// ==================================================

// URLAnalytics stores analytics data in time-based buckets
// This table is optimized for TimescaleDB and will be converted to a hypertable
type URLAnalytics struct {
	URLID      uint64    `json:"url_id" gorm:"primaryKey;index;not null"`
	Referrer   string    `json:"referrer" gorm:"primaryKey;index;not null"`
	Country    string    `json:"country" gorm:"primaryKey;index;not null"`
	City       string    `json:"city" gorm:"primaryKey;index;not null"`
	Device     string    `json:"device" gorm:"primaryKey;index;not null"`
	Browser    string    `json:"browser" gorm:"primaryKey;index;not null"`
	OS         string    `json:"os" gorm:"primaryKey;index;not null"`
	ClickCount int64     `json:"click_count" gorm:"default:0"`
	BucketTime time.Time `json:"bucket_time" gorm:"primaryKey;index;not null"`
}

// Define model structs for the aggregated analytics tables
// URLAnalyticsHourly represents hourly aggregated analytics data
type URLAnalyticsHourly struct {
	db.URLAnalyticsHourly
}

// URLAnalyticsDaily represents daily aggregated analytics data
type URLAnalyticsDaily struct {
	db.URLAnalyticsDaily
}

// URLAnalyticsMonthly represents monthly aggregated analytics data
type URLAnalyticsMonthly struct {
	db.URLAnalyticsMonthly
}
