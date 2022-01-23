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

// Settings
type Settings struct {
	UUID      string `db:"uuid"`      // uuid
	ResetPass bool   `db:"resetpass"` // resetpass
}

// SMS settings
type SmsSettings struct {
	AppId  string `db:"appid"`  // appid
	AppKey string `db:"appkey"` // appkey
	Sign   string `db:"sign"`   // sign
	MsgId1 int    `db:"msgid1"` // verify code
	MsgId2 int    `db:"msgid2"` //
}
