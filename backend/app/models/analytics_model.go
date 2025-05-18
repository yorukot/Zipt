package models

import (
	"time"

	db "github.com/yorukot/zipt/pkg/database"
)

func init() {
	// Auto-migrate analytics models
	db.GetDB().AutoMigrate(&URLAnalytics{})
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
	URLID      uint64    `json:"url_id" gorm:"column:url_id;primaryKey;index;not null"`
	Referrer   string    `json:"referrer" gorm:"primaryKey;index;not null"`
	Country    string    `json:"country" gorm:"primaryKey;index;not null"`
	City       string    `json:"city" gorm:"primaryKey;index;not null"`
	Device     string    `json:"device" gorm:"primaryKey;index;not null"`
	Browser    string    `json:"browser" gorm:"primaryKey;index;not null"`
	OS         string    `json:"os" gorm:"primaryKey;index;not null"`
	ClickCount int64     `json:"click_count" gorm:"column:click_count;default:0"`
	BucketTime time.Time `json:"bucket_time" gorm:"column:bucket_time;primaryKey;index;not null"`
}

// TableName specifies the table name for URLAnalytics
func (URLAnalytics) TableName() string {
	return "url_analytics"
}

// URLAnalyticsHourlies to store hourly aggregated analytics data
type URLAnalyticsHourlies struct {
	URLID       uint64    `json:"url_id" gorm:"column:url_id;primaryKey;index;not null"`
	Referrer    string    `json:"referrer" gorm:"primaryKey;index;not null"`
	Country     string    `json:"country" gorm:"primaryKey;index;not null"`
	City        string    `json:"city" gorm:"primaryKey;index;not null"`
	Device      string    `json:"device" gorm:"primaryKey;index;not null"`
	Browser     string    `json:"browser" gorm:"primaryKey;index;not null"`
	OS          string    `json:"os" gorm:"primaryKey;index;not null"`
	BucketHour  time.Time `json:"bucket_hour" gorm:"column:bucket_hour;primaryKey;index;not null"`
	TotalClicks int64     `json:"total_clicks" gorm:"column:total_clicks"`
}

// TableName specifies the table name for URLAnalyticsHourlies
func (URLAnalyticsHourlies) TableName() string {
	return "url_analytics_hourlies"
}

// URLAnalyticsDailies to store daily aggregated analytics data
type URLAnalyticsDailies struct {
	URLID       uint64    `json:"url_id" gorm:"column:url_id;primaryKey;index;not null"`
	Referrer    string    `json:"referrer" gorm:"primaryKey;index;not null"`
	Country     string    `json:"country" gorm:"primaryKey;index;not null"`
	City        string    `json:"city" gorm:"primaryKey;index;not null"`
	Device      string    `json:"device" gorm:"primaryKey;index;not null"`
	Browser     string    `json:"browser" gorm:"primaryKey;index;not null"`
	OS          string    `json:"os" gorm:"primaryKey;index;not null"`
	BucketDay   time.Time `json:"bucket_day" gorm:"column:bucket_day;primaryKey;index;not null"`
	TotalClicks int64     `json:"total_clicks" gorm:"column:total_clicks"`
}

// TableName specifies the table name for URLAnalyticsDailies
func (URLAnalyticsDailies) TableName() string {
	return "url_analytics_dailies"
}

// URLAnalyticsMonthlies to store monthly aggregated analytics data
type URLAnalyticsMonthlies struct {
	URLID       uint64    `json:"url_id" gorm:"column:url_id;primaryKey;index;not null"`
	Referrer    string    `json:"referrer" gorm:"primaryKey;index;not null"`
	Country     string    `json:"country" gorm:"primaryKey;index;not null"`
	City        string    `json:"city" gorm:"primaryKey;index;not null"`
	Device      string    `json:"device" gorm:"primaryKey;index;not null"`
	Browser     string    `json:"browser" gorm:"primaryKey;index;not null"`
	OS          string    `json:"os" gorm:"primaryKey;index;not null"`
	BucketMonth time.Time `json:"bucket_month" gorm:"column:bucket_month;primaryKey;index;not null"`
	TotalClicks int64     `json:"total_clicks" gorm:"column:total_clicks"`
}

// TableName specifies the table name for URLAnalyticsMonthlies
func (URLAnalyticsMonthlies) TableName() string {
	return "url_analytics_monthlies"
}
