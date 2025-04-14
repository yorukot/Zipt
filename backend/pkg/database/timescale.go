package db

import (
	"time"

	"github.com/yorukot/zipt/pkg/logger"
)

// Define model structs for the aggregated analytics tables
// URLAnalyticsHourly represents hourly aggregated analytics data
type URLAnalyticsHourly struct {
	URLID      uint64    `gorm:"primaryKey;index;not null"`
	Referrer   string    `gorm:"primaryKey;index;not null"`
	Country    string    `gorm:"primaryKey;index;not null"`
	City       string    `gorm:"primaryKey;index;not null"`
	Device     string    `gorm:"primaryKey;index;not null"`
	Browser    string    `gorm:"primaryKey;index;not null"`
	OS         string    `gorm:"primaryKey;index;not null"`
	ClickCount int64     `gorm:"default:0"`
	BucketTime time.Time `gorm:"primaryKey;index;not null"`
}

// URLAnalyticsDaily represents daily aggregated analytics data
type URLAnalyticsDaily struct {
	URLID      uint64    `gorm:"primaryKey;index;not null"`
	Referrer   string    `gorm:"primaryKey;index;not null"`
	Country    string    `gorm:"primaryKey;index;not null"`
	City       string    `gorm:"primaryKey;index;not null"`
	Device     string    `gorm:"primaryKey;index;not null"`
	Browser    string    `gorm:"primaryKey;index;not null"`
	OS         string    `gorm:"primaryKey;index;not null"`
	ClickCount int64     `gorm:"default:0"`
	BucketTime time.Time `gorm:"primaryKey;index;not null"`
}

// URLAnalyticsMonthly represents monthly aggregated analytics data
type URLAnalyticsMonthly struct {
	URLID      uint64    `gorm:"primaryKey;index;not null"`
	Referrer   string    `gorm:"primaryKey;index;not null"`
	Country    string    `gorm:"primaryKey;index;not null"`
	City       string    `gorm:"primaryKey;index;not null"`
	Device     string    `gorm:"primaryKey;index;not null"`
	Browser    string    `gorm:"primaryKey;index;not null"`
	OS         string    `gorm:"primaryKey;index;not null"`
	ClickCount int64     `gorm:"default:0"`
	BucketTime time.Time `gorm:"primaryKey;index;not null"`
}

// InitializeTimescale sets up TimescaleDB hypertables and continuous aggregation policies
// This should be called after all models are auto-migrated
func InitializeTimescale() error {
	logger.Log.Sugar().Info("Initializing TimescaleDB for analytics")

	// Auto-migrate the aggregated tables
	if err := DB.AutoMigrate(&URLAnalyticsHourly{}, &URLAnalyticsDaily{}, &URLAnalyticsMonthly{}); err != nil {
		return err
	}

	// Execute raw SQL to:
	// 1. Convert URL analytics tables to hypertables
	// 2. Create continuous aggregates for each granularity
	// 3. Set up retention policies

	// Convert URLAnalytics to hypertable with 2-minute intervals
	rawResult := DB.Exec(`
		-- Create the raw analytics hypertable (partitioning on BucketTime)
		SELECT create_hypertable('url_analytics', 'bucket_time', if_not_exists => TRUE);
		
		-- Create hourly continuous aggregate with real-time capabilities
		CREATE MATERIALIZED VIEW IF NOT EXISTS url_analytics_hourly
		WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
		SELECT
			url_id,
			referrer,
			country,
			city,
			device,
			browser,
			os,
			time_bucket('1 hour', bucket_time) AS bucket_time,
			SUM(click_count) AS click_count
		FROM url_analytics
		GROUP BY url_id, referrer, country, city, device, browser, os, time_bucket('1 hour', bucket_time);
		
		-- Create daily continuous aggregate with real-time capabilities
		CREATE MATERIALIZED VIEW IF NOT EXISTS url_analytics_daily
		WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
		SELECT
			url_id,
			referrer,
			country,
			city,
			device,
			browser,
			os,
			time_bucket('1 day', bucket_time) AS bucket_time,
			SUM(click_count) AS click_count
		FROM url_analytics_hourly
		GROUP BY url_id, referrer, country, city, device, browser, os, time_bucket('1 day', bucket_time);
		
		-- Create monthly continuous aggregate with real-time capabilities
		CREATE MATERIALIZED VIEW IF NOT EXISTS url_analytics_monthly
		WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
		SELECT
			url_id,
			referrer,
			country,
			city,
			device,
			browser,
			os,
			time_bucket('30 days', bucket_time) AS bucket_time,
			SUM(click_count) AS click_count
		FROM url_analytics_daily
		GROUP BY url_id, referrer, country, city, device, browser, os, time_bucket('30 days', bucket_time);
	`)

	if rawResult.Error != nil {
		return rawResult.Error
	}

	// Set up continuous aggregate policies for real-time updates
	rawResult = DB.Exec(`
		-- Configure real-time aggregation for hourly data
		SELECT add_continuous_aggregate_policy('url_analytics_hourly',
			start_offset => INTERVAL '3 hours',
			end_offset => INTERVAL '1 minute',
			schedule_interval => INTERVAL '5 minutes');
			
		-- Configure real-time aggregation for daily data
		SELECT add_continuous_aggregate_policy('url_analytics_daily',
			start_offset => INTERVAL '2 days',
			end_offset => INTERVAL '1 hour',
			schedule_interval => INTERVAL '30 minutes');
			
		-- Configure real-time aggregation for monthly data
		SELECT add_continuous_aggregate_policy('url_analytics_monthly',
			start_offset => INTERVAL '31 days',
			end_offset => INTERVAL '1 day',
			schedule_interval => INTERVAL '1 day');
	`)

	if rawResult.Error != nil {
		return rawResult.Error
	}

	// Set up retention policies for each time granularity
	rawResult = DB.Exec(`
		-- Raw data retention: 12 hours
		SELECT add_retention_policy('url_analytics', INTERVAL '12 hours');
		
		-- Hourly data retention: 14 days
		SELECT add_retention_policy('url_analytics_hourly', INTERVAL '14 days');
		
		-- Daily data retention: 365 days
		SELECT add_retention_policy('url_analytics_daily', INTERVAL '365 days');
		
		-- Monthly data retention: 100 years
		SELECT add_retention_policy('url_analytics_monthly', INTERVAL '100 years');
	`)

	if rawResult.Error != nil {
		return rawResult.Error
	}

	logger.Log.Sugar().Info("TimescaleDB successfully configured with multi-level continuous aggregates")
	return nil
}

// IsTimescaleDBEnabled checks if TimescaleDB is enabled by querying for the extension
func IsTimescaleDBEnabled() bool {
	var count int64
	result := DB.Raw("SELECT COUNT(*) FROM pg_extension WHERE extname = 'timescaledb'").Count(&count)
	return result.Error == nil && count > 0
}
