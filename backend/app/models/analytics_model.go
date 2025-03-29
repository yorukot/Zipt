package models

import (
	"time"

	db "github.com/yorukot/zipt/pkg/database"
)

func init() {
	// Only auto-migrate URLMetric, removing the old tables
	db.GetDB().AutoMigrate(&URLMetric{})

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

// URLMetric stores analytics data in time-based buckets
// This table is optimized for TimescaleDB and will be converted to a hypertable
type URLMetric struct {
	URLID       uint64    `json:"url_id" gorm:"primaryKey;index;not null"`
	MetricType  string    `json:"metric_type" gorm:"primaryKey;index;not null"` // referrer, country, city, clicks
	MetricValue string    `json:"metric_value" gorm:"primaryKey;not null"`      // The actual value being tracked
	Granularity string    `json:"granularity" gorm:"primaryKey;index;not null"` // 2min, hour, day, month
	BucketTime  time.Time `json:"bucket_time" gorm:"primaryKey;index;not null"` // The timestamp of the bucket
	ClickCount  int64     `json:"click_count" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName overrides the table name for URLMetric
func (URLMetric) TableName() string {
	return "url_metrics"
}
