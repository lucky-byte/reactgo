package db

import (
	"database/sql"
	"fmt"
	"reflect"

	"github.com/jmoiron/sqlx"
	"github.com/jmoiron/sqlx/reflectx"
	"github.com/pkg/errors"
)

// A wrapper to sqlx.DB.Rebind()
func Rebind(ql string) string {
	return mainDB.Rebind(ql)
}

// for update/insert/delete, check result must affected just 1 row
func MustAffected1Row(res sql.Result, ql string) error {
	rows, err := res.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "SQL")
	}
	if rows != 1 {
		return fmt.Errorf("'%s' 影响了 %d 行, 期望 1 行", ql, rows)
	}
	return nil
}

var _scannerInterface = reflect.TypeOf((*sql.Scanner)(nil)).Elem()

// select one row, it's a error if result sets is empty or has more than one rows
//
// *NOTE*:
//   this function only support StructScan and Scan, not MapScan or SliceScan,
func SelectOne(ql string, dest interface{}, params ...interface{}) error {
	v := reflect.ValueOf(dest)

	if v.Kind() != reflect.Ptr {
		return fmt.Errorf("GetOne() 必须传一个指针，而不是值")
	}
	if v.IsNil() {
		return fmt.Errorf("GetOne() 传了 nil 指针")
	}
	t := reflectx.Deref(v.Type())

	rows, err := mainDB.Queryx(mainDB.Rebind(ql), params...)
	if err != nil {
		return errors.Wrap(err, "SQL")
	}
	defer rows.Close()

	count := 0

	for rows.Next() {
		if count > 0 {
			return fmt.Errorf("SQL: '%s' 返回了多行, 期望 1 行", ql)
		}
		if reflect.PtrTo(t).Implements(_scannerInterface) { // like types.NullString
			err = rows.Scan(dest)
		} else if t.Kind() == reflect.Struct { // a struct
			err = rows.StructScan(dest)
		} else { // base type
			err = rows.Scan(dest)
		}
		if err != nil {
			return errors.Wrap(err, "SQL")
		}
		count += 1
	}
	if err = rows.Err(); err != nil {
		return errors.Wrap(err, "SQL")
	}
	if count == 0 {
		return fmt.Errorf("SQL: '%s' 未返回结果, 期望 1 行", ql)
	}
	return nil
}

// execute insert/update/delete, and must and only affect 1 row
func ExecOne(ql string, params ...interface{}) error {
	res, err := mainDB.Exec(mainDB.Rebind(ql), params...)
	if err != nil {
		return errors.Wrap(err, "SQL")
	}
	return MustAffected1Row(res, ql)
}

// a wrapper to sqlx.Get()
func Get(ql string, dest interface{}, params ...interface{}) error {
	return mainDB.Get(dest, mainDB.Rebind(ql), params...)
}

// a wrapper to sqlx.Select()
func Select(ql string, dest interface{}, params ...interface{}) error {
	return mainDB.Select(dest, mainDB.Rebind(ql), params...)
}

// a wrapper to sqlx.Exec()
func Exec(ql string, params ...interface{}) error {
	_, err := mainDB.Exec(mainDB.Rebind(ql), params...)
	return err
}

// a wrapper to sqlx.In()
func In(ql string, args ...interface{}) (string, []interface{}, error) {
	return sqlx.In(ql, args...)
}
