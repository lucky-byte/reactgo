package db

import (
	"database/sql"
	"time"
)

// Images
type Image struct {
	UUID     string    `db:"uuid"`      // unique id
	CreateAt time.Time `db:"create_at"` // create time
	UpdateAt time.Time `db:"update_at"` // update time
	Data     []byte    `db:"data"`      // image data
	Mime     string    `db:"mime"`      // image mime type
	ETag     string    `db:"etag"`      // image data digest
}

// Users
type User struct {
	UUID     string         `db:"uuid"`      // uuid
	CreateAt time.Time      `db:"create_at"` // create time
	UpdateAt time.Time      `db:"update_at"` // update time
	SigninAt time.Time      `db:"signin_at"` // last sign in time
	Disabled bool           `db:"disabled"`  // disabled
	Deleted  bool           `db:"deleted"`   // deleted
	UserId   string         `db:"userid"`    // userid
	Passwd   string         `db:"passwd"`    // password
	Name     string         `db:"name"`      // user name
	Email    string         `db:"email"`     // email
	Mobile   string         `db:"mobile"`    // mobile
	Address  sql.NullString `db:"address"`   // address
	TFA      bool           `db:"tfa"`       // 2fa
	ACL      string         `db:"acl"`       // acl
	NSignin  int            `db:"n_signin"`  // signin count in total
}

// Signin history
type SigninHistory struct {
	UUID     string         `db:"uuid"`      // unique id
	CreateAt time.Time      `db:"create_at"` // create time
	User     string         `db:"user_uuid"` // user uuid
	UserId   string         `db:"userid"`    // userid
	Name     string         `db:"name"`      // user name
	IP       string         `db:"ip"`        // ip address
	City     sql.NullString `db:"city"`      // city
	UA       string         `db:"ua"`        // user agent
}

// ACL
type ACL struct {
	UUID     string    `db:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at"` // create time
	UpdateAt time.Time `db:"update_at"` // update time
	Code     int       `db:"code"`      // code
	Name     string    `db:"name"`      // name
	Summary  string    `db:"summary"`   // summary
}

// ACL Allows
type ACLAllow struct {
	UUID  string `db:"uuid"`  // uuid
	ACL   string `db:"acl"`   // acl uuid
	Code  int    `db:"code"`  // code
	Title string `db:"title"` // title
	URL   string `db:"url"`   // url
	Read  bool   `db:"read"`  // readable
	Write bool   `db:"write"` // writable
	Admin bool   `db:"admin"` // Admin
}

// 渠道开发商
type BankDevelop struct {
	UUID     string         `db:"uuid"`      // uuid
	CreateAt time.Time      `db:"create_at"` // create time
	UpdateAt time.Time      `db:"update_at"` // update time
	Disabled bool           `db:"disabled"`  // disabled
	Deleted  bool           `db:"deleted"`   // deleted
	Name     string         `db:"name"`      // name
	Mobile   string         `db:"mobile"`    // mobile
	Email    string         `db:"email"`     // email
	Address  sql.NullString `db:"address"`   // address
	Company  sql.NullString `db:"company"`   // company
}

// 商户拓展商
type MerchDevelop struct {
	UUID     string         `db:"uuid"`      // uuid
	CreateAt time.Time      `db:"create_at"` // create time
	UpdateAt time.Time      `db:"update_at"` // update time
	Disabled bool           `db:"disabled"`  // disabled
	Deleted  bool           `db:"deleted"`   // deleted
	Name     string         `db:"name"`      // name
	Mobile   string         `db:"mobile"`    // mobile
	Email    string         `db:"email"`     // email
	Address  sql.NullString `db:"address"`   // address
	Company  sql.NullString `db:"company"`   // company
}

// 渠道
type Bank struct {
	UUID     string         `db:"uuid"`      // uuid
	CreateAt time.Time      `db:"create_at"` // create time
	UpdateAt time.Time      `db:"update_at"` // update time
	Disabled bool           `db:"disabled"`  // disabled
	Deleted  bool           `db:"deleted"`   // deleted
	Develop  sql.NullString `db:"company"`   // develop
	Code     string         `db:"code"`      // code
	Name     string         `db:"name"`      // name
	Fullname string         `db:"fullname"`  // fullname
	Contact  string         `db:"contact"`   // contact
	Mobile   string         `db:"mobile"`    // mobile
	Email    string         `db:"email"`     // email
	Address  sql.NullString `db:"address"`   // address
}
