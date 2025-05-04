package db

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/yorukot/zipt/pkg/logger"
)

// InitializeTimescale sets up TimescaleDB hypertables and continuous aggregation policies
// This should be called after all models are auto-migrated
func InitializeTimescale() error {
	logger.Log.Sugar().Info("Initializing TimescaleDB for analytics")

	// Get the current file's directory
	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)
	sqlPath := filepath.Join(dir, "timescale.sql")

	// Read SQL file
	query, err := os.ReadFile(sqlPath)
	if err != nil {
		logger.Log.Sugar().Errorf("Failed to read SQL file: %v", err)
		return err
	}

	// Check if TimescaleDB is enabled
	if !IsTimescaleDBEnabled() {
		logger.Log.Sugar().Errorf("TimescaleDB extension is not enabled in the database. Please install and enable it first.")
		return fmt.Errorf("TimescaleDB extension not enabled")
	}

	// Split SQL file into individual statements and execute each one
	statements := strings.Split(string(query), ";")
	for i, stmt := range statements {
		// Skip empty statements
		stmt = strings.TrimSpace(stmt)
		if stmt == "" {
			continue
		}

		// Execute statement without transaction
		logger.Log.Sugar().Debugf("Executing TimescaleDB statement %d", i+1)
		if err := DB.Exec(stmt).Error; err != nil {
			// Common errors to handle more gracefully
			if strings.Contains(err.Error(), "already exists") {
				logger.Log.Sugar().Warnf("TimescaleDB object already exists (continuing): %v", err)
				continue
			}
			if strings.Contains(err.Error(), "relation") && strings.Contains(err.Error(), "does not exist") {
				logger.Log.Sugar().Warnf("Relation does not exist yet (continuing): %v", err)
				continue
			}

			logger.Log.Sugar().Errorf("Failed to execute SQL statement: %v\nStatement: %s", err, stmt)
			return err
		}
	}

	logger.Log.Sugar().Info("TimescaleDB successfully configured with multi-level continuous aggregates")
	return nil
}

// IsTimescaleDBEnabled checks if TimescaleDB is enabled by querying for the extension
func IsTimescaleDBEnabled() bool {
	var count int64
	result := DB.Raw("SELECT COUNT(*) FROM pg_extension WHERE extname = 'timescaledb'").Count(&count)

	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to check TimescaleDB extension: %v", result.Error)
		return false
	}

	isEnabled := result.Error == nil && count > 0
	logger.Log.Sugar().Infof("TimescaleDB extension enabled: %v", isEnabled)

	return isEnabled
}

// ForceInitializeTimescale attempts to initialize TimescaleDB regardless of errors
// Can be called manually during application startup if needed
func ForceInitializeTimescale() {
	logger.Log.Sugar().Info("Attempting to force initialize TimescaleDB...")

	// Check if TimescaleDB extension is installed
	if !IsTimescaleDBEnabled() {
		logger.Log.Sugar().Warn("TimescaleDB extension is not installed or enabled. Some analytics features will not work properly.")
		return
	}

	// Try to initialize anyway
	if err := InitializeTimescale(); err != nil {
		logger.Log.Sugar().Warnf("TimescaleDB initialization completed with warnings: %v", err)
	} else {
		logger.Log.Sugar().Info("TimescaleDB successfully initialized")
	}

	// Verify materialized views exist
	views := []string{"url_analytics_hourly", "url_analytics_daily", "url_analytics_monthly"}
	for _, view := range views {
		var count int64
		if err := DB.Raw(fmt.Sprintf("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '%s'", view)).Count(&count).Error; err != nil {
			logger.Log.Sugar().Errorf("Error checking if view %s exists: %v", view, err)
		} else if count == 0 {
			logger.Log.Sugar().Warnf("TimescaleDB materialized view %s does not exist", view)
		} else {
			logger.Log.Sugar().Infof("TimescaleDB materialized view %s exists", view)
		}
	}
}
