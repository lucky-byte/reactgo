package db

import (
	"log"
	"time"

	"github.com/jmoiron/sqlx"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/jackc/pgx/v4/stdlib"
	_ "modernc.org/sqlite"
)

const (
	DriverSqlite = "sqlite"
	DriverPgx    = "pgx"
	DriverMySQL  = "mysql"
)

// mainDB is global database connection pool
var mainDB *sqlx.DB

// 连接数据库
func Connect(driver string, dsn string) {
	if mainDB != nil {
		log.Printf("Repeat connection to the database")
		return
	}
	var err error

	mainDB, err = sqlx.Connect(driver, dsn)
	if err != nil {
		log.Panicf("不能连接数据库 %s(%s): %v", driver, dsn, err)
	}
	mainDB.SetMaxOpenConns(100)
	mainDB.SetMaxIdleConns(50)
	mainDB.SetConnMaxIdleTime(30 * time.Minute)
	mainDB.SetConnMaxLifetime(90 * time.Second)

	// Initial goqu sql builder
	initBuilderDialect(driver)
}

// 断开数据库连接
func Disconnect() {
	if err := mainDB.Close(); err != nil {
		log.Printf("Disconnect from Database error: %v", err)
	}
	mainDB = nil
}

// Default get default database connection pool
func Default() *sqlx.DB {
	if mainDB == nil {
		log.Panic("Database is not connection yet.")
	}
	return mainDB
}

// Get driver name
func DriverName() string {
	return mainDB.DriverName()
}
