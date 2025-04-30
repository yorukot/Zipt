package db

import (
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

	// Split SQL file into individual statements and execute each one
	statements := strings.Split(string(query), ";")
	for _, stmt := range statements {
		// Skip empty statements
		if strings.TrimSpace(stmt) == "" {
			continue
		}

		// Execute statement without transaction
		if err := DB.Exec(stmt).Error; err != nil {
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
	return result.Error == nil && count > 0
}
