package db

import (
	"fmt"
	"os"
	"time"

	"github.com/yorukot/zipt/pkg/logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB is the global GORM database instance
var DB *gorm.DB

// IsTimescaleEnabled tracks whether TimescaleDB is enabled
var IsTimescaleEnabled bool

// DefaultAppName is used when no app name is specified for the database
const DefaultAppName = "zipt"

// init initializes the database connection when the package is imported
// Database configuration is read from environment variables:
//   - DATABASE_HOST: Database server hostname or IP
//   - DATABASE_PORT: Database server port
//   - DATABASE_USER: Database username
//   - DATABASE_PASSWORD: Database password
//   - DATABASE_DBNAME: Database name
//   - DATABASE_SSLMODE: SSL mode for PostgreSQL
//   - DATABASE_MAX_IDLE_CONNS: Maximum number of idle connections
//   - DATABASE_MAX_OPEN_CONNS: Maximum number of open connections
//   - DATABASE_CONN_MAX_LIFETIME: Maximum lifetime of connections in minutes
func init() {
	logger.Log.Sugar().Info("Initializing PostgreSQL with TimescaleDB connection")

	// Ensure database exists
	ensureDatabaseExists()

	var err error

	// Initialize PostgreSQL connection
	DB, err = initPostgreSQL()
	if err != nil {
		logger.Log.Sugar().Fatalf("Failed to connect to PostgreSQL database: %v", err)
	}

	// Always enable TimescaleDB extension
	if err := enableTimescaleExtension(); err != nil {
		logger.Log.Sugar().Fatalf("Failed to enable TimescaleDB extension: %v", err)
	}

	// Check if TimescaleDB is properly enabled
	IsTimescaleEnabled = IsTimescaleDBEnabled()
	if !IsTimescaleEnabled {
		logger.Log.Sugar().Fatalf("TimescaleDB extension is not enabled. Please install TimescaleDB")
	}
	logger.Log.Sugar().Info("TimescaleDB extension is enabled")

	// Configure connection pool
	configureConnectionPool()

	logger.Log.Sugar().Info("Successfully connected to PostgreSQL with TimescaleDB")

	// Ensure default domain exists
	ensureDefaultDomain()
}

// getDatabaseName gets the database name from environment variables or generates a default name
func getDatabaseName() string {
	// First check if database name is explicitly set
	dbName := os.Getenv("DATABASE_DBNAME")
	if dbName == "" {
		os.Setenv("DATABASE_DBNAME", "zipt")
	}

	return dbName
}

// ensureDatabaseExists checks if the database exists and creates it if it doesn't
func ensureDatabaseExists() {
	// Get or generate database name
	dbname := getDatabaseName()

	host := os.Getenv("DATABASE_HOST")
	user := os.Getenv("DATABASE_USER")
	password := os.Getenv("DATABASE_PASSWORD")
	port := os.Getenv("DATABASE_PORT")
	sslmode := os.Getenv("DATABASE_SSLMODE")

	// Validate required parameters
	if host == "" || user == "" || port == "" {
		logger.Log.Sugar().Warn("Missing required PostgreSQL connection parameters, skipping database existence check")
		return
	}

	// Connect to the 'postgres' database to check if our database exists
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=postgres port=%s sslmode=%s",
		host, user, password, port, sslmode,
	)

	tempDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Log.Sugar().Warnf("Could not connect to PostgreSQL server to check database existence: %v", err)
		return
	}

	// Check if database exists
	var exists int
	query := fmt.Sprintf("SELECT 1 FROM pg_database WHERE datname = '%s'", dbname)
	if err := tempDB.Raw(query).Scan(&exists).Error; err != nil {
		logger.Log.Sugar().Warnf("Error checking if database exists: %v", err)
		return
	}

	// Create database if it doesn't exist
	if exists != 1 {
		logger.Log.Sugar().Infof("Database %s does not exist, creating it", dbname)
		createDBQuery := fmt.Sprintf("CREATE DATABASE %s", dbname)
		if err := tempDB.Exec(createDBQuery).Error; err != nil {
			logger.Log.Sugar().Warnf("Failed to create database %s: %v", dbname, err)
			return
		}
		logger.Log.Sugar().Infof("Database %s created successfully", dbname)
	} else {
		logger.Log.Sugar().Infof("Database %s already exists", dbname)
	}

	// Close the temporary connection
	sqlDB, _ := tempDB.DB()
	if sqlDB != nil {
		_ = sqlDB.Close()
	}
}

// configureConnectionPool sets up the database connection pool parameters
func configureConnectionPool() {
	sqlDB, err := DB.DB()
	if err != nil {
		logger.Log.Sugar().Fatalf("Failed to get SQL DB instance: %v", err)
	}

	// Get connection pool settings from environment or use defaults
	maxIdleConns := getEnvIntWithDefault("DATABASE_MAX_IDLE_CONNS", 10)
	maxOpenConns := getEnvIntWithDefault("DATABASE_MAX_OPEN_CONNS", 100)
	connMaxLifetime := time.Duration(getEnvIntWithDefault("DATABASE_CONN_MAX_LIFETIME", 30)) * time.Minute

	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetConnMaxLifetime(connMaxLifetime)

	// Check connection
	if err = sqlDB.Ping(); err != nil {
		logger.Log.Sugar().Fatalf("Failed to ping PostgreSQL database: %v", err)
	}
}

// initPostgreSQL initializes a PostgreSQL connection
// Required env vars: DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD,
// DATABASE_PORT, DATABASE_SSLMODE
func initPostgreSQL() (*gorm.DB, error) {
	host := os.Getenv("DATABASE_HOST")
	user := os.Getenv("DATABASE_USER")
	password := os.Getenv("DATABASE_PASSWORD")
	dbname := getDatabaseName()
	port := os.Getenv("DATABASE_PORT")
	sslmode := os.Getenv("DATABASE_SSLMODE")

	// Validate required parameters
	if host == "" || user == "" || port == "" {
		return nil, fmt.Errorf("missing required PostgreSQL connection parameters")
	}

	// Build connection string
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		host, user, password, dbname, port, sslmode,
	)

	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}

//-----------------------------------------------------------------------------
// Utility Functions
//-----------------------------------------------------------------------------

// getEnvIntWithDefault gets an integer from environment variable or returns the default value
func getEnvIntWithDefault(key string, defaultVal int) int {
	value := os.Getenv(key)
	if value == "" {
		return defaultVal
	}

	var intVal int
	_, err := fmt.Sscanf(value, "%d", &intVal)
	if err != nil {
		logger.Log.Sugar().Warnf("Invalid value for %s: %s, using default: %d", key, value, defaultVal)
		return defaultVal
	}

	return intVal
}

// GetDB returns the GORM DB instance
func GetDB() *gorm.DB {
	return DB
}

// CloseDatabase closes the database connection
func CloseDatabase() {
	sqlDB, err := DB.DB()
	if err != nil {
		logger.Log.Sugar().Fatal("Failed to get SQL DB instance:", err)
	}

	if err := sqlDB.Close(); err != nil {
		logger.Log.Sugar().Fatal("Failed to close database connection:", err)
	}
	logger.Log.Info("Successfully disconnected from database")
}

// Initialize sets up the database and initializes all required components
func Initialize() {
	// This function can be called explicitly to initialize the database
	// It's useful for cases where you want to control when the database is initialized
	// For most cases, the init() function is sufficient
	logger.Log.Sugar().Info("Explicitly initializing database connection")

	// Ensure the default domain exists
	ensureDefaultDomain()

	// Initialize TimescaleDB
	if err := InitializeTimescale(); err != nil {
		logger.Log.Sugar().Warnf("Failed to initialize TimescaleDB: %v", err)
	}
}

// ensureDefaultDomain ensures that the default domain (ID 0) exists in the database
func ensureDefaultDomain() {
	// Check if the default domain exists
	var count int64
	result := DB.Table("domains").Where("id = 0").Count(&count)

	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to check if default domain exists: %v", result.Error)
		return
	}

	// If the default domain doesn't exist, create it
	if count == 0 {
		logger.Log.Sugar().Info("Creating default domain (ID 0)")

		// Get the default domain from environment variables
		defaultDomainName := os.Getenv("SHORT_DOMAIN")
		if defaultDomainName == "" {
			defaultDomainName = "localhost:8080" // Default for local development
		}

		now := time.Now().Format("2006-01-02 15:04:05")

		// Use raw SQL to ensure ID 0 is set explicitly
		sql := `INSERT INTO domains (id, domain, verified, verify_token, created_at, updated_at) 
				VALUES (0, ?, true, 'default', ?, ?)`

		result = DB.Exec(sql, defaultDomainName, now, now)

		if result.Error != nil {
			logger.Log.Sugar().Errorf("Failed to create default domain: %v", result.Error)
		} else {
			logger.Log.Sugar().Infof("Default domain created successfully with domain: %s", defaultDomainName)
		}
	} else {
		// Ensure default domain has the current SHORT_DOMAIN value
		defaultDomainName := os.Getenv("SHORT_DOMAIN")
		if defaultDomainName != "" {
			// Update the default domain if SHORT_DOMAIN is set
			result = DB.Exec("UPDATE domains SET domain = ? WHERE id = 0", defaultDomainName)
			if result.Error != nil {
				logger.Log.Sugar().Errorf("Failed to update default domain: %v", result.Error)
			} else if result.RowsAffected > 0 {
				logger.Log.Sugar().Infof("Default domain updated to: %s", defaultDomainName)
			}
		}

		logger.Log.Sugar().Info("Default domain (ID 0) already exists")
	}
}

// enableTimescaleExtension enables the TimescaleDB extension on PostgreSQL
func enableTimescaleExtension() error {
	logger.Log.Sugar().Info("Enabling TimescaleDB extension")

	// Try to create the extension if it doesn't exist
	result := DB.Exec("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE")
	if result.Error != nil {
		return fmt.Errorf("failed to create TimescaleDB extension: %v", result.Error)
	}

	logger.Log.Sugar().Info("TimescaleDB extension enabled successfully")
	return nil
}
