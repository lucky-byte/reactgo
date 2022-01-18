package db

import (
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/lucky-byte/bdb/serve/xlog"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/jackc/pgx/v4/stdlib"
)

const (
	DriverSqlite = "sqlite"
	DriverPgx    = "pgx"
	DriverMySQL  = "mysql"
)

// mainDB is global database connection pool
var mainDB *sqlx.DB

// Connect open database connection
func Connect(driver string, dsn string) {
	if mainDB != nil {
		xlog.X.Debug("Repeat connection to the database")
		return
	}
	// Rename sqlite3 to sqlite to prevent using the original sqlite driver
	if driver == "sqlite3" {
		driver = DriverSqlite
	}
	sqliteRegister(dsn)

	mainDB = sqlx.MustConnect(driver, dsn)

	mainDB.SetMaxOpenConns(100)
	mainDB.SetMaxIdleConns(50)
	mainDB.SetConnMaxIdleTime(30 * time.Minute)
	mainDB.SetConnMaxLifetime(90 * time.Second)

	// Initial goqu sql builder
	initBuilderDialect(driver)
}

// Disconnect from database
func Disconnect() {
	if err := mainDB.Close(); err != nil {
		xlog.X.WithError(err).Error("Disconnect from Database error")
	}
	mainDB = nil
}

// Default get default database connection pool
func Default() *sqlx.DB {
	if mainDB == nil {
		xlog.X.Panic("Database is not connection yet.")
	}
	return mainDB
}

// Get driver name
func DriverName() string {
	return mainDB.DriverName()
}
