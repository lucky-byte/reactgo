package db

import (
	"database/sql"
	"time"
)

// 图片
type Image struct {
	UUID     string    `db:"uuid"`      // unique id
	CreateAt time.Time `db:"create_at"` // create time
	UpdateAt time.Time `db:"update_at"` // update time
	Data     []byte    `db:"data"`      // image 数据
	Mime     string    `db:"mime"`      // image mime 类型
	ETag     string    `db:"etag"`      // image 数据哈希
}

// 用户
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

// 登录历史
type SigninHistory struct {
	UUID      string    `db:"uuid"`      // unique id
	CreateAt  time.Time `db:"create_at"` // create time
	User      string    `db:"user_uuid"` // user uuid
	UserId    string    `db:"userid"`    // userid
	Name      string    `db:"name"`      // 姓名
	IP        string    `db:"ip"`        // ip 地址
	Country   string    `db:"country"`   // 国家
	Province  string    `db:"province"`  // 省
	City      string    `db:"city"`      // 市
	District  string    `db:"district"`  // 区
	Longitude float64   `db:"longitude"` // 精度
	Latitude  float64   `db:"latitude"`  // 纬度
	UA        string    `db:"ua"`        // user agent
	ClientId  string    `db:"clientid"`  // 客户端id
	Trust     bool      `db:"trust"`     // 信任设备
}

// 访问控制角色
type ACL struct {
	UUID     string    `db:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at"` // create time
	UpdateAt time.Time `db:"update_at"` // update time
	Code     int       `db:"code"`      // 代码
	Name     string    `db:"name"`      // 名称
	Summary  string    `db:"summary"`   // 描述
}

// 访问控制权限
type ACLAllow struct {
	UUID   string `db:"uuid"`   // uuid
	ACL    string `db:"acl"`    // acl uuid
	Code   int    `db:"code"`   // 菜单代码
	Title  string `db:"title"`  // 菜单标题
	URL    string `db:"url"`    // url
	IRead  bool   `db:"iread"`  // 访问权限
	IWrite bool   `db:"iwrite"` // 修改权限
	IAdmin bool   `db:"iadmin"` // 管理权限
}

// 设置
type Setting struct {
	UUID          string `db:"uuid"`           // uuid
	BugReport     bool   `db:"bugreport"`      // 允许报告错误
	LookUserid    bool   `db:"lookuserid"`     // 允许找回登录名
	ResetPass     bool   `db:"resetpass"`      // 允许找回密码
	TokenDuration int    `db:"token_duration"` // 会话持续时间
}

// 短信配置
type SmsSetting struct {
	AppId     string `db:"appid"`      // appid
	SecretId  string `db:"secret_id"`  // secret id
	SecretKey string `db:"secret_key"` // secret key
	Sign      string `db:"sign"`       // 签名
	MsgID1    string `db:"msgid1"`     // 验证码模板ID
}

// 邮件 MTA
type MTA struct {
	UUID     string `db:"uuid"`     // uuid
	Name     string `db:"name"`     // 名称
	Host     string `db:"host"`     // 主机
	Port     int    `db:"port"`     // 端口
	SSLMode  bool   `db:"sslmode"`  // SSL 模式
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

// 定时任务
type Task struct {
	UUID     string         `db:"uuid"`      // uuid
	CreateAt time.Time      `db:"create_at"` // 创建时间
	UpdateAt time.Time      `db:"update_at"` // 更新时间
	Name     string         `db:"name"`      // 名称
	Summary  string         `db:"summary"`   // 描述
	Cron     string         `db:"cron"`      // CRON 表达式
	Type     int            `db:"type"`      // 类型
	Path     string         `db:"path"`      // 文件路径
	LastFire time.Time      `db:"last_fire"` // 最后执行时间
	NFire    int            `db:"nfire"`     // 执行次数
	Disabled bool           `db:"disabled"`  // 是否停用
	Note     sql.NullString `db:"note"`      // 备注
}

// 系统事件
type Event struct {
	UUID     string    `db:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at"` // 创建时间
	Level    int       `db:"level"`     // 级别
	Title    string    `db:"title"`     // 标题
	Message  string    `db:"message"`   // 消息
	Fresh    bool      `db:"fresh"`     // 未读
}

// IP 定位
type GeoIP struct {
	WebKey string `db:"webkey"` // 高德开放平台 web 服务 key
	ApiVer string `db:"apiver"` // 高德开放平台 IP 定位接口版本
}

// 层次结构
type Tree struct {
	UUID     string    `db:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at"` // 创建时间
	UpdateAt time.Time `db:"update_at"` // 更新时间
	Name     string    `db:"name"`      // 名称
	Summary  string    `db:"summary"`   // 描述
	Up       string    `db:"up"`        // 上级
	TPath    string    `db:"tpath"`     // 路径
	NLevel   int       `db:"nlevel"`    // 级别
	Disabled bool      `db:"disabled"`  // 禁用
	SortNo   int       `db:"sortno"`    // 排序
}

type TreeBind struct {
	UUID     string    `db:"uuid"      json:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at" json:"create_at"` // 创建时间
	Node     string    `db:"node"      json:"node"`      // 节点
	Entity   string    `db:"entity"    json:"entity"`    // 资源
	Type     int       `db:"type"      json:"type"`      // 类型
}

// 公告
type Bulletin struct {
	UUID      string    `db:"uuid"`       // uuid
	CreateAt  time.Time `db:"create_at"`  // 创建时间
	ExpiryAt  time.Time `db:"expiry_at"`  // 过期时间
	Title     string    `db:"title"`      // 标题
	Content   string    `db:"content"`    // 征文
	ReadUsers int       `db:"read_users"` // 阅读用户
}
