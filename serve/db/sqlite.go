package db

import (
	"database/sql"
	"database/sql/driver"
	"fmt"
	"os"
	"path"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/lucky-byte/bdb/serve/xlog"

	"github.com/mattn/go-sqlite3"
)

var (
	registerOnce sync.Once
	sqliteDSN    string
	sqlitePath   string
)

// Register sqlite driver
// Don't register in init() is beacuse we need dsn to attach schemas
func sqliteRegister(dsn string) {
	registerOnce.Do(func() {
		sqliteDSN = dsn
		sqlitePath = sqliteDsnPath(dsn)

		sql.Register("sqlite", &sqlite3.SQLiteDriver{
			ConnectHook: func(conn *sqlite3.SQLiteConn) error {
				if err := sqliteAttachSchemas(conn, dsn); err != nil {
					xlog.X.WithError(err).Error("Failed to attach schemas")
				}
				return nil
			},
		})
	})
}

// Get database path from dsn, for example:
// 	dsn:  /tmp/dumb.sqlite?share_mode=true&mode=rw
//	path: /tmp
func sqliteDsnPath(dsn string) string {
	dbpath := dsn

	// Remove content after ? if present
	if i := strings.IndexRune(dsn, '?'); i > 0 {
		dbpath = dsn[:i]
	}
	return path.Dir(dbpath)
}

// Attach database as schema
func sqliteAttachSchemas(conn *sqlite3.SQLiteConn, dsn string) error {
	files, err := os.ReadDir(sqlitePath)
	if err != nil {
		return err
	}
	pattern := regexp.MustCompile(`^kiam(_[0-9a-zA-Z]{20})?\.sqlite$`)

	for _, file := range files {
		if file.IsDir() {
			continue
		}
		filename := file.Name()
		if !pattern.MatchString(filename) {
			continue
		}
		schema := strings.Split(filename, ".")[0]
		dbname := path.Join(sqlitePath, filename)

		sql := "attach database ? as ?"
		_, err := conn.Exec(sql, []driver.Value{dbname, schema})
		if err != nil {
			return err
		}
		xlog.X.Tracef("Attach %s as schema %s", dbname, schema)
	}
	return nil
}

func SqliteDSN() string {
	return sqliteDSN
}

func SqlitePath() string {
	return sqlitePath
}

// clean unused db file(not belong to any project)
func SqliteClean() {
	files, err := os.ReadDir(sqlitePath)
	if err != nil {
		xlog.X.WithError(err).Warn("clean sqlite databases failed")
		return
	}
	pattern := regexp.MustCompile(`^kiam_[0-9a-zA-Z]{20}\.sqlite$`)

	for _, f := range files {
		fname := f.Name()
		if !pattern.MatchString(fname) {
			continue
		}
		arr := strings.Split(fname, ".")

		ql := `select count(*) from kiam.projects where schema_id = ?`
		var count int

		err = mainDB.Get(&count, ql, strings.Replace(arr[0], "kiam_", "", 1))
		if err != nil {
			xlog.X.WithError(err).Warn("clean sqlite databases error")
			continue
		}
		if count == 0 {
			newname := fmt.Sprintf("%d.%s", time.Now().Unix(), fname)
			err = os.Rename(
				path.Join(sqlitePath, fname),
				path.Join(sqlitePath, newname),
			)
			if err != nil {
				xlog.X.WithError(err).Warn("clean sqlite databases error")
			} else {
				xlog.X.Tracef("success clean unused sqlite database '%s'.", fname)
			}
		}
	}
}
