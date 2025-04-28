package db

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/yorukot/zipt/pkg/logger"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// DB is the global GORM database instance
var DB *gorm.DB

// IsTimescaleEnabled tracks whether TimescaleDB is enabled
var IsTimescaleEnabled bool

//-----------------------------------------------------------------------------
// Database Types and Configuration
//-----------------------------------------------------------------------------

// Supported database types
const (
	PostgreSQL = "postgres" // PostgreSQL database
	MySQL      = "mysql"    // MySQL database
	MariaDB    = "mariadb"  // MariaDB database (uses MySQL driver)
	SQLite     = "sqlite"   // SQLite database
)

// DefaultAppName is used when no app name is specified for the database
const DefaultAppName = "zipt"

// init initializes the database connection when the package is imported
// Database configuration is read from environment variables:
//   - DATABASE_TYPE: Type of database to connect to (default: postgres)
//   - DATABASE_HOST: Database server hostname or IP
//   - DATABASE_PORT: Database server port
//   - DATABASE_USER: Database username
//   - DATABASE_PASSWORD: Database password
//   - DATABASE_DBNAME: Database name (or auto-generated based on APP_NAME and APP_ENV)
//   - DATABASE_SSLMODE: SSL mode for PostgreSQL
//   - DATABASE_PATH: File path for SQLite database
//   - DATABASE_MAX_IDLE_CONNS: Maximum number of idle connections
//   - DATABASE_MAX_OPEN_CONNS: Maximum number of open connections
//   - DATABASE_CONN_MAX_LIFETIME: Maximum lifetime of connections in minutes
//   - ENABLE_TIMESCALE: Enable TimescaleDB for time-series data (default: false)

func init() {
	// Get database type from environment
	dbType := os.Getenv("DATABASE_TYPE")
	if dbType == "" {
		dbType = PostgreSQL // Default to PostgreSQL if not specified
		logger.Log.Sugar().Info("DATABASE_TYPE not set, defaulting to PostgreSQL")
	}

	// Ensure database exists
	ensureDatabaseExists(dbType)

	var err error

	// Initialize the appropriate database based on type
	switch dbType {
	case PostgreSQL:
		logger.Log.Sugar().Info("Initializing PostgreSQL connection")
		DB, err = initPostgreSQL()

		// Check if TimescaleDB is requested
		if err == nil && strings.ToLower(os.Getenv("ENABLE_TIMESCALE")) == "true" {
			if err := enableTimescaleExtension(); err != nil {
				logger.Log.Sugar().Warnf("Failed to enable TimescaleDB extension: %v", err)
			} else {
				IsTimescaleEnabled = IsTimescaleDBEnabled()
				if IsTimescaleEnabled {
					logger.Log.Sugar().Info("TimescaleDB extension is enabled")
				}
			}
		}
	case MySQL, MariaDB:
		logger.Log.Sugar().Infof("Initializing %s connection", dbType)
		DB, err = initMySQL()
	case SQLite:
		logger.Log.Sugar().Info("Initializing SQLite connection")
		DB, err = initSQLite()
	default:
		logger.Log.Sugar().Fatalf("Unsupported database type: %s", dbType)
	}

	if err != nil {
		logger.Log.Sugar().Fatalf("Failed to connect to %s database: %v", dbType, err)
	}

	// Configure connection pool
	configureConnectionPool(dbType)

	logger.Log.Sugar().Infof("Successfully connected to %s database", dbType)

	// Ensure default domain exists
	ensureDefaultDomain()
}

// getDatabaseName gets the database name from environment variables or generates a default name
// if DATABASE_DBNAME is not set, it generates a name based on APP_NAME and APP_ENV
// Format: [app_name]_[environment] (e.g., zipt_development)
func getDatabaseName() string {
	// First check if database name is explicitly set
	dbName := os.Getenv("DATABASE_DBNAME")
	if dbName != "" {
		return dbName
	}

	// Get application name and environment for name generation
	appName := os.Getenv("APP_NAME")
	if appName == "" {
		appName = DefaultAppName
		logger.Log.Sugar().Info("APP_NAME not set, using default app name for database: ", DefaultAppName)
	}

	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" {
		appEnv = "development"
		logger.Log.Sugar().Info("APP_ENV not set, using default environment: development")
	}

	// Generate database name
	dbName = fmt.Sprintf("%s_%s", strings.ToLower(appName), strings.ToLower(appEnv))
	logger.Log.Sugar().Infof("DATABASE_DBNAME not set, using generated name: %s", dbName)

	// Store the generated name in environment for other parts of the application
	os.Setenv("DATABASE_DBNAME", dbName)

	return dbName
}

// ensureDatabaseExists checks if the database exists and creates it if it doesn't
func ensureDatabaseExists(dbType string) {
	// Get or generate database name
	dbname := getDatabaseName()

	switch dbType {
	case PostgreSQL:
		ensurePostgreSQLDatabase(dbname)
	case MySQL, MariaDB:
		ensureMySQLDatabase(dbname)
	case SQLite:
		// For SQLite, the database file is created automatically if it doesn't exist
		logger.Log.Sugar().Info("SQLite database will be created automatically if it doesn't exist")
	default:
		logger.Log.Sugar().Warnf("Database existence check not implemented for %s", dbType)
	}
}

// ensurePostgreSQLDatabase checks if the PostgreSQL database exists and creates it if it doesn't
func ensurePostgreSQLDatabase(dbname string) {
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

// ensureMySQLDatabase checks if the MySQL database exists and creates it if it doesn't
func ensureMySQLDatabase(dbname string) {
	host := os.Getenv("DATABASE_HOST")
	user := os.Getenv("DATABASE_USER")
	password := os.Getenv("DATABASE_PASSWORD")
	port := os.Getenv("DATABASE_PORT")

	// Validate required parameters
	if host == "" || user == "" || port == "" {
		logger.Log.Sugar().Warn("Missing required MySQL connection parameters, skipping database existence check")
		return
	}

	// Connect to MySQL without specifying a database
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/",
		user, password, host, port,
	)

	tempDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Log.Sugar().Warnf("Could not connect to MySQL server to check database existence: %v", err)
		return
	}

	// Check if database exists
	var databases []string
	if err := tempDB.Raw("SHOW DATABASES").Scan(&databases).Error; err != nil {
		logger.Log.Sugar().Warnf("Error checking if database exists: %v", err)
		return
	}

	exists := false
	for _, db := range databases {
		if db == dbname {
			exists = true
			break
		}
	}

	// Create database if it doesn't exist
	if !exists {
		logger.Log.Sugar().Infof("Database %s does not exist, creating it", dbname)
		createDBQuery := fmt.Sprintf("CREATE DATABASE `%s`", dbname)
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
func configureConnectionPool(dbType string) {
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
		logger.Log.Sugar().Fatalf("Failed to ping %s database: %v", dbType, err)
	}
}

//-----------------------------------------------------------------------------
// Database Initialization Functions
//-----------------------------------------------------------------------------

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

// initMySQL initializes a MySQL or MariaDB connection
// Required env vars: DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD,
// DATABASE_PORT
func initMySQL() (*gorm.DB, error) {
	host := os.Getenv("DATABASE_HOST")
	user := os.Getenv("DATABASE_USER")
	password := os.Getenv("DATABASE_PASSWORD")
	dbname := getDatabaseName()
	port := os.Getenv("DATABASE_PORT")

	// Validate required parameters
	if host == "" || user == "" || port == "" {
		return nil, fmt.Errorf("missing required MySQL connection parameters")
	}

	// Build connection string
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=True&loc=Local",
		user, password, host, port, dbname,
	)

	return gorm.Open(mysql.Open(dsn), &gorm.Config{})
}

// initSQLite initializes a SQLite connection
// Required env vars: DATABASE_PATH (or uses default "database.db")
func initSQLite() (*gorm.DB, error) {
	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		dbPath = "database.db" // Default SQLite database file
		logger.Log.Sugar().Info("DATABASE_PATH not set, using default: database.db")
	}

	return gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
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

	// If TimescaleDB is enabled, initialize it
	if IsTimescaleEnabled {
		if err := InitializeTimescale(); err != nil {
			logger.Log.Sugar().Warnf("Failed to initialize TimescaleDB: %v", err)
		}
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
	logger.Log.Sugar().Info("Attempting to enable TimescaleDB extension")

	// Try to create the extension if it doesn't exist
	result := DB.Exec("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE")
	if result.Error != nil {
		return fmt.Errorf("failed to create TimescaleDB extension: %v", result.Error)
	}

	logger.Log.Sugar().Info("TimescaleDB extension enabled successfully")
	return nil
}
