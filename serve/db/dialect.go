package db

import (
	"time"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/mysql"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	_ "github.com/doug-martin/goqu/v9/dialect/sqlite3"
	"github.com/doug-martin/goqu/v9/exp"
)

var dialect goqu.DialectWrapper

func initBuilderDialect(driver string) {
	switch driver {
	case DriverMySQL:
		dialect = goqu.Dialect("mysql")
	case DriverPgx:
		dialect = goqu.Dialect("postgres")
	case DriverSqlite:
		dialect = goqu.Dialect("sqlite3")
	default:
		panic("不能创建 SQL Builder, 数据库驱动无效")
	}
}

// 使用数据库方言
func From(table ...any) *goqu.SelectDataset {
	return dialect.From(table...)
}

// 以当前时间区域解析外部传入的日期
func ParseDate(date string) (time.Time, error) {
	return time.ParseInLocation("2006/01/02", date, time.Local)
}

// 如果是在时间之间进行比较，sqlite 貌似不能正确处理 UTC 格式，例如:
// BETWEEN '2022-05-07T16:00:00Z' AND '2022-05-08T15:59:59.999Z'
// 与
// BETWEEN '2022-05-07 16:00:00' AND '2022-05-08 15:59:59.999'
// 的查询结果不同，后者才是正确的结果
//
func TimeRange(s time.Time, e time.Time) exp.RangeVal {
	if DriverName() == DriverSqlite {
		s1 := s.UTC().Format("2006-01-02 15:04:05.999")
		e1 := e.UTC().Format("2006-01-02 15:04:05.999")
		return goqu.Range(s1, e1)
	}
	return goqu.Range(s, e)
}
