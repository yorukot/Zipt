package db

import (
	"fmt"

	"github.com/yorukot/zipt/pkg/logger"
)

// InitializeTimescale sets up TimescaleDB hypertables and continuous aggregation policies
// This should be called after all models are auto-migrated
func InitializeTimescale() error {
	logger.Log.Sugar().Info("Initializing TimescaleDB for analytics")

	// Create hypertable for URLMetric
	if err := createHypertable("url_metrics", "bucket_time"); err != nil {
		return err
	}

	// Setup continuous aggregations for different time granularities
	if err := setupContinuousAggregations(); err != nil {
		return err
	}

	// Setup retention policies
	if err := setupRetentionPolicies(); err != nil {
		return err
	}

	logger.Log.Sugar().Info("TimescaleDB initialization completed successfully")
	return nil
}

// createHypertable converts a regular PostgreSQL table into a TimescaleDB hypertable
func createHypertable(tableName, timeColumn string) error {
	// Check if the table is already a hypertable
	var count int64
	query := fmt.Sprintf("SELECT count(*) FROM timescaledb_information.hypertables WHERE hypertable_name = '%s'", tableName)
	if err := DB.Raw(query).Count(&count).Error; err != nil {
		return fmt.Errorf("error checking if %s is a hypertable: %v", tableName, err)
	}

	if count > 0 {
		logger.Log.Sugar().Infof("Table %s is already a hypertable", tableName)
		return nil
	}

	// Convert to hypertable with 1 day chunks
	sql := fmt.Sprintf(
		"SELECT create_hypertable('%s', '%s', chunk_time_interval => INTERVAL '1 day')",
		tableName, timeColumn,
	)

	if err := DB.Exec(sql).Error; err != nil {
		return fmt.Errorf("failed to create hypertable for %s: %v", tableName, err)
	}

	logger.Log.Sugar().Infof("Created hypertable for %s", tableName)
	return nil
}

// setupContinuousAggregations creates continuous aggregation policies for downsampling data
func setupContinuousAggregations() error {
	// Create hourly aggregation from 2-minute data
	if err := createContinuousAggregation(
		"url_metrics_hourly",
		"url_metrics",
		"time_bucket('1 hour', bucket_time) AS bucket_time",
		"url_id, metric_type, metric_value",
		"SUM(click_count) AS click_count",
		"bucket_time >= NOW() - INTERVAL '14 days'",
		"2 minutes",
	); err != nil {
		return err
	}

	// Create daily aggregation from hourly data
	if err := createContinuousAggregation(
		"url_metrics_daily",
		"url_metrics_hourly",
		"time_bucket('1 day', bucket_time) AS bucket_time",
		"url_id, metric_type, metric_value",
		"SUM(click_count) AS click_count",
		"bucket_time >= NOW() - INTERVAL '365 days'",
		"1 hour",
	); err != nil {
		return err
	}

	// Create monthly aggregation from daily data
	if err := createContinuousAggregation(
		"url_metrics_monthly",
		"url_metrics_daily",
		"time_bucket('30 days', bucket_time) AS bucket_time",
		"url_id, metric_type, metric_value",
		"SUM(click_count) AS click_count",
		"bucket_time >= NOW() - INTERVAL '100 years'",
		"1 day",
	); err != nil {
		return err
	}

	return nil
}

// createContinuousAggregation creates a continuous aggregation view and policy
func createContinuousAggregation(
	viewName string,
	sourceTable string,
	timeBucket string,
	groupColumns string,
	aggregates string,
	whereClause string,
	refreshInterval string,
) error {
	// Check if the view already exists
	var count int64
	if err := DB.Raw(fmt.Sprintf("SELECT count(*) FROM pg_views WHERE viewname = '%s'", viewName)).Count(&count).Error; err != nil {
		return fmt.Errorf("error checking if view %s exists: %v", viewName, err)
	}

	// Create the materialized view if it doesn't exist
	if count == 0 {
		// Create the materialized view
		createViewSQL := fmt.Sprintf(`
			CREATE MATERIALIZED VIEW %s
			WITH (timescaledb.continuous) AS
			SELECT %s, %s, %s
			FROM %s
			WHERE %s
			GROUP BY %s, %s;
		`, viewName, timeBucket, groupColumns, aggregates, sourceTable, whereClause, timeBucket, groupColumns)

		if err := DB.Exec(createViewSQL).Error; err != nil {
			return fmt.Errorf("failed to create continuous aggregation view %s: %v", viewName, err)
		}

		// Set refresh policy
		refreshSQL := fmt.Sprintf(`
			SELECT add_continuous_aggregate_policy('%s',
				start_offset => INTERVAL '1 month',
				end_offset => INTERVAL '1 hour',
				schedule_interval => INTERVAL '%s');
		`, viewName, refreshInterval)

		if err := DB.Exec(refreshSQL).Error; err != nil {
			return fmt.Errorf("failed to set refresh policy for %s: %v", viewName, err)
		}

		logger.Log.Sugar().Infof("Created continuous aggregation view %s", viewName)
	} else {
		logger.Log.Sugar().Infof("Continuous aggregation view %s already exists", viewName)
	}

	return nil
}

// setupRetentionPolicies creates data retention policies for each time granularity
func setupRetentionPolicies() error {
	// For original data (2-minute intervals), keep for 12 hours
	if err := createRetentionPolicy("url_metrics", "12 hours"); err != nil {
		return err
	}

	// For hourly data, keep for 14 days
	if err := createRetentionPolicy("url_metrics_hourly", "14 days"); err != nil {
		return err
	}

	// For daily data, keep for 365 days
	if err := createRetentionPolicy("url_metrics_daily", "365 days"); err != nil {
		return err
	}

	// For monthly data, keep for 100 years (effectively forever)
	if err := createRetentionPolicy("url_metrics_monthly", "3650 days"); err != nil {
		return err
	}

	return nil
}

// createRetentionPolicy sets up a data retention policy for a hypertable
func createRetentionPolicy(tableName, retention string) error {
	sql := fmt.Sprintf("SELECT add_retention_policy('%s', INTERVAL '%s')", tableName, retention)

	if err := DB.Exec(sql).Error; err != nil {
		// Ignore errors about existing policies
		if err.Error() != fmt.Sprintf("relation \"%s\" already has a retention policy", tableName) {
			return fmt.Errorf("failed to create retention policy for %s: %v", tableName, err)
		}
		logger.Log.Sugar().Infof("Retention policy for %s already exists", tableName)
	} else {
		logger.Log.Sugar().Infof("Created retention policy for %s (%s)", tableName, retention)
	}

	return nil
}

// IsTimescaleDBEnabled checks if TimescaleDB extension is installed
func IsTimescaleDBEnabled() bool {
	var count int64
	if err := DB.Raw("SELECT count(*) FROM pg_extension WHERE extname = 'timescaledb'").Count(&count).Error; err != nil {
		logger.Log.Sugar().Warnf("Error checking TimescaleDB extension: %v", err)
		return false
	}
	return count > 0
}
