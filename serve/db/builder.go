package db

import (
	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/mysql"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	_ "github.com/doug-martin/goqu/v9/dialect/sqlite3"
)

var dialect goqu.DialectWrapper

func initBuilderDialect(driver string) {
	switch driver {
	case "mysql":
		dialect = goqu.Dialect("mysql")
	case "pgx":
		dialect = goqu.Dialect("postgres")
	case "sqlite":
		dialect = goqu.Dialect("sqlite3")
	default:
		panic("不能创建 SQL Builder, 数据库驱动无效")
	}
}

// 使用数据库方言
func From(table ...any) *goqu.SelectDataset {
	return dialect.From(table...)
}
