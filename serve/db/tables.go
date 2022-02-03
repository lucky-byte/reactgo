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
	UUID       string         `db:"uuid"`        // uuid
	CreateAt   time.Time      `db:"create_at"`   // 创建时间
	UpdateAt   time.Time      `db:"update_at"`   // 更新时间
	SigninAt   time.Time      `db:"signin_at"`   // 最后登录时间
	Disabled   bool           `db:"disabled"`    // 已禁用
	Deleted    bool           `db:"deleted"`     // 已删除
	UserId     string         `db:"userid"`      // 登录名
	Passwd     string         `db:"passwd"`      // 密码
	Name       string         `db:"name"`        // 姓名
	Avatar     string         `db:"avatar"`      // 头像
	Email      string         `db:"email"`       // 邮箱地址
	Mobile     string         `db:"mobile"`      // 手机号
	Address    sql.NullString `db:"address"`     // 联系地址
	TFA        bool           `db:"tfa"`         // 短信认证
	ACL        string         `db:"acl"`         // 访问控制
	SecretCode string         `db:"secretcode"`  // 安全操作码
	TOTPSecret string         `db:"totp_secret"` // TOTP 密钥
	NSignin    int            `db:"n_signin"`    // 总登录次数
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

// Setting
type Setting struct {
	UUID          string `db:"uuid"`           // uuid
	ResetPass     bool   `db:"resetpass"`      // 找回密码
	TokenDuration int    `db:"token_duration"` // 会话持续时间
}

// 短信配置
type SmsSetting struct {
	AppId     string `db:"appid"`      // appid
	SecretId  string `db:"secret_id"`  // secret id
	SecretKey string `db:"secret_key"` // secret key
	Sign      string `db:"sign"`       // sign
	MsgID1    string `db:"msgid1"`     // 验证码模板ID
}

// 邮件 MTA
type MTA struct {
	UUID     string `db:"uuid"`     // uuid
	Name     string `db:"name"`     // 名称
	Host     string `db:"host"`     // 主机
	Port     int    `db:"port"`     // 端口
	SSL      bool   `db:"ssl"`      // SSL 模式
	Sender   string `db:"sender"`   // 发送地址
	Prefix   string `db:"prefix"`   // 标题前缀
	ReplyTo  string `db:"replyto"`  // 回复地址
	Username string `db:"username"` // 认证用户名
	Passwd   string `db:"passwd"`   // 密码
	CC       string `db:"cc"`       // 抄送
	BCC      string `db:"bcc"`      // 密送
	SortNo   int    `db:"sortno"`   // 排序序号
	NSent    int    `db:"nsent"`    // 发送量
}
