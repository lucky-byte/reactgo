package db

import (
	"database/sql"
	"time"
)

type Debug struct {
	Debug bool `db:"debug"      json:"debug"` // Debug mode
}

type ImageStore struct {
	Place    int    `db:"place"     json:"place"`    // 位置
	RootPath string `db:"rootpath"  json:"rootpath"` // 文件系统路径(绝对路径)
}

// 图片
type Image struct {
	UUID     string    `db:"uuid"      json:"uuid"`      // unique id
	CreateAt time.Time `db:"create_at" json:"create_at"` // create time
	UpdateAt time.Time `db:"update_at" json:"update_at"` // update time
	Place    int       `db:"place"     json:"place"`     // 位置
	Data     []byte    `db:"data"      json:"data"`      // image 数据
	Path     string    `db:"path"      json:"path"`      // 文件系统路径(相对路径)
	Mime     string    `db:"mime"      json:"mime"`      // image mime 类型
	ETag     string    `db:"etag"      json:"etag"`      // image 数据哈希
}

// 用户
type User struct {
	UUID         string    `db:"uuid"           json:"uuid"`           // uuid
	CreateAt     time.Time `db:"create_at"      json:"create_at"`      // 创建时间
	UpdateAt     time.Time `db:"update_at"      json:"update_at"`      // 更新时间
	SigninAt     time.Time `db:"signin_at"      json:"signin_at"`      // 最后登录时间
	Disabled     bool      `db:"disabled"       json:"disabled"`       // 已禁用
	Deleted      bool      `db:"deleted"        json:"deleted"`        // 已删除
	UserId       string    `db:"userid"         json:"userid"`         // 登录名
	Passwd       string    `db:"passwd"         json:"passwd"`         // 密码
	Name         string    `db:"name"           json:"name"`           // 姓名
	Avatar       string    `db:"avatar"         json:"avatar"`         // 头像
	Email        string    `db:"email"          json:"email"`          // 邮箱地址
	Mobile       string    `db:"mobile"         json:"mobile"`         // 手机号
	IdNo         string    `db:"idno"           json:"idno"`           // 身份证号
	Address      string    `db:"address"        json:"address"`        // 联系地址
	AcctName     string    `db:"acct_name"      json:"acct_name"`      // 银行账号开户人
	AcctNo       string    `db:"acct_no"        json:"acct_no"`        // 银行账号
	AcctIdno     string    `db:"acct_idno"      json:"acct_idno"`      // 银行账号身份证
	AcctMobile   string    `db:"acct_mobile"    json:"acct_mobile"`    // 银行账号手机号
	AcctBankName string    `db:"acct_bank_name" json:"acct_bank_name"` // 银行账号开户行
	TFA          bool      `db:"tfa"            json:"tfa"`            // 短信认证
	ACL          string    `db:"acl"            json:"acl"`            // 访问控制
	SecretCode   string    `db:"secretcode"     json:"secretcode"`     // 安全操作码
	TOTPSecret   string    `db:"totp_secret"    json:"totp_secret"`    // TOTP 密钥
	NSignin      int       `db:"n_signin"       json:"n_signin"`       // 总登录次数
	NotiPopup    bool      `db:"noti_popup"     json:"noti_popup"`     // 弹出通知消息
	NotiBrowser  bool      `db:"noti_browser"   json:"noti_browser"`   // 弹出浏览器通知
	NotiMail     bool      `db:"noti_mail"      json:"noti_mail"`      // 通知发送邮件
}

// 登录历史
type SigninHistory struct {
	UUID      string    `db:"uuid"      json:"uuid"`      // uuid
	CreateAt  time.Time `db:"create_at" json:"create_at"` // 创建时间
	User      string    `db:"user_uuid" json:"user_uuid"` // 用户 uuid
	UserId    string    `db:"userid"    json:"userid"`    // 用户 userid
	Name      string    `db:"name"      json:"name"`      // 姓名
	IP        string    `db:"ip"        json:"ip"`        // IP 地址
	Country   string    `db:"country"   json:"country"`   // 国家
	Province  string    `db:"province"  json:"province"`  // 省
	City      string    `db:"city"      json:"city"`      // 市
	District  string    `db:"district"  json:"district"`  // 区
	Longitude float64   `db:"longitude" json:"longitude"` // 精度
	Latitude  float64   `db:"latitude"  json:"latitude"`  // 纬度
	UA        string    `db:"ua"        json:"ua"`        // 客户端 userAgent
	ClientId  string    `db:"clientid"  json:"clientid"`  // 客户端id
	Trust     bool      `db:"trust"     json:"trust"`     // 信任设备
	TFA       int       `db:"tfa"       json:"tfa"`       // 两因素认证方式
	ActType   int       `db:"act_type"  json:"act_type"`  // 登录方法
	OAuthP    string    `db:"oauthp"    json:"oauthp"`    // 三方账号提供方
}

// 访问控制角色
type ACL struct {
	UUID     string    `db:"uuid"       json:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at"  json:"create_at"` // 创建时间
	UpdateAt time.Time `db:"update_at"  json:"update_at"` // 更新时间
	Code     int       `db:"code"       json:"code"`      // 代码
	Name     string    `db:"name"       json:"name"`      // 名称
	Summary  string    `db:"summary"    json:"summary"`   // 描述
	Features string    `db:"features"   json:"features"`  // 特征
}

// 访问控制权限
type ACLAllow struct {
	UUID   string `db:"uuid"    json:"uuid"`   // uuid
	ACL    string `db:"acl"     json:"acl"`    // acl uuid
	Code   int    `db:"code"    json:"code"`   // 菜单代码
	Title  string `db:"title"   json:"title"`  // 菜单标题
	URL    string `db:"url"     json:"url"`    // url
	IRead  bool   `db:"iread"   json:"iread"`  // 访问权限
	IWrite bool   `db:"iwrite"  json:"iwrite"` // 修改权限
	IAdmin bool   `db:"iadmin"  json:"iadmin"` // 管理权限
}

// 邮件服务
type MTA struct {
	UUID     string    `db:"uuid"      json:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at" json:"create_at"` // 创建时间
	UpdateAt time.Time `db:"update_at" json:"update_at"` // 更新时间
	Name     string    `db:"name"      json:"name"`      // 名称
	Host     string    `db:"host"      json:"host"`      // 主机
	Port     int       `db:"port"      json:"port"`      // 端口
	SSLMode  bool      `db:"sslmode"   json:"sslmode"`   // SSL 模式
	Sender   string    `db:"sender"    json:"sender"`    // 发送地址
	Prefix   string    `db:"prefix"    json:"prefix"`    // 标题前缀
	ReplyTo  string    `db:"replyto"   json:"replyto"`   // 回复地址
	Username string    `db:"username"  json:"username"`  // 认证用户名
	Passwd   string    `db:"passwd"    json:"passwd"`    // 密码
	CC       string    `db:"cc"        json:"cc"`        // 抄送
	BCC      string    `db:"bcc"       json:"bcc"`       // 密送
	SortNo   int       `db:"sortno"    json:"sortno"`    // 排序序号
	NSent    int       `db:"nsent"     json:"nsent"`     // 发送量
	Disabled bool      `db:"disabled"  json:"disabled"`  // 是否停用
}

// 短信服务
type SMS struct {
	UUID      string    `db:"uuid"       json:"uuid"`       // uuid
	CreateAt  time.Time `db:"create_at"  json:"create_at"`  // 创建时间
	UpdateAt  time.Time `db:"update_at"  json:"update_at"`  // 更新时间
	ISP       string    `db:"isp"        json:"isp"`        // 运营商
	ISPName   string    `db:"isp_name"   json:"isp_name"`   // 运营商名称
	AppId     string    `db:"appid"      json:"appid"`      // appid
	SecretId  string    `db:"secret_id"  json:"secret_id"`  // secret id
	SecretKey string    `db:"secret_key" json:"secret_key"` // secret key
	Prefix    string    `db:"prefix"     json:"prefix"`     // 签名
	TextNo1   string    `db:"textno1"    json:"textno1"`    // 验证码模板
	SortNo    int       `db:"sortno"     json:"sortno"`     // 排序序号
	NSent     int       `db:"nsent"      json:"nsent"`      // 发送量
	Disabled  bool      `db:"disabled"   json:"disabled"`   // 是否停用
}

// 账号设置
type Account struct {
	Signupable   bool   `db:"signupable"   json:"signupable"`   // 开放用户注册
	SignupACL    string `db:"signupacl"    json:"signupacl"`    // 用户注册角色
	LookUserid   bool   `db:"lookuserid"   json:"lookuserid"`   // 允许找回登录名
	ResetPass    bool   `db:"resetpass"    json:"resetpass"`    // 允许找回密码
	SessDuration int    `db:"sessduration" json:"sessduration"` // 会话持续时间
	JWTSignKey   string `db:"jwtsignkey"   json:"jwtsignkey"`   // JWT 签名密钥
	JWTSignKey2  string `db:"jwtsignkey2"  json:"jwtsignkey2"`  // JWT 签名密钥(旧)
}

// 定时任务
type Task struct {
	UUID     string         `db:"uuid"      json:"uuid"`      // uuid
	CreateAt time.Time      `db:"create_at" json:"create_at"` // 创建时间
	UpdateAt time.Time      `db:"update_at" json:"update_at"` // 更新时间
	Name     string         `db:"name"      json:"name"`      // 名称
	Summary  string         `db:"summary"   json:"summary"`   // 描述
	Cron     string         `db:"cron"      json:"cron"`      // CRON 表达式
	Type     int            `db:"type"      json:"type"`      // 类型
	Path     string         `db:"path"      json:"path"`      // 文件路径
	LastFire time.Time      `db:"last_fire" json:"last_fire"` // 最后执行时间
	NFire    int            `db:"nfire"     json:"nfire"`     // 执行次数
	Disabled bool           `db:"disabled"  json:"disabled"`  // 是否停用
	Note     sql.NullString `db:"note"      json:"note"`      // 备注
}

// 系统事件
type Event struct {
	UUID     string    `db:"uuid"      json:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at" json:"create_at"` // 创建时间
	Level    int       `db:"level"     json:"level"`     // 级别
	Title    string    `db:"title"     json:"title"`     // 标题
	Message  string    `db:"message"   json:"message"`   // 消息
	Fresh    bool      `db:"fresh"     json:"fresh"`     // 未读
}

// IP 定位
type GeoIP struct {
	AMapWebKey    string `db:"amap_webkey"    json:"amap_webkey"`    // 高德开放平台 web 服务 key
	AMapEnable    bool   `db:"amap_enable"    json:"amap_enable"`    // 是否允许高德开放平台
	AMapApiVer    string `db:"amap_apiver"    json:"amap_apiver"`    // 高德开放平台 IP 定位接口版本
	TencentWebKey string `db:"tencent_webkey" json:"tencent_webkey"` // 腾讯位置服务 web 服务 key
	TencentEnable bool   `db:"tencent_enable" json:"tencent_enable"` // 是否允许腾讯位置服务
}

// 层次结构
type Tree struct {
	UUID      string    `db:"uuid"       json:"uuid"`       // uuid
	CreateAt  time.Time `db:"create_at"  json:"create_at"`  // 创建时间
	UpdateAt  time.Time `db:"update_at"  json:"update_at"`  // 更新时间
	Name      string    `db:"name"       json:"name"`       // 名称
	Summary   string    `db:"summary"    json:"summary"`    // 描述
	Up        string    `db:"up"         json:"up"`         // 上级
	TPath     string    `db:"tpath"      json:"tpath"`      // 路径
	TPathHash string    `db:"tpath_hash" json:"tpath_hash"` // 路径 md5 hash 值
	NLevel    int       `db:"nlevel"     json:"nlevel"`     // 级别
	Disabled  bool      `db:"disabled"   json:"disabled"`   // 禁用
	SortNo    int       `db:"sortno"     json:"sortno"`     // 排序
}

type TreeBind struct {
	UUID     string    `db:"uuid"      json:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at" json:"create_at"` // 创建时间
	Node     string    `db:"node"      json:"node"`      // 节点
	Entity   string    `db:"entity"    json:"entity"`    // 资源
	Type     int       `db:"type"      json:"type"`      // 类型
}

// 系统公告
type Bulletin struct {
	UUID     string    `db:"uuid"      json:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at" json:"create_at"` // 创建时间
	UserUUID string    `db:"user_uuid" json:"user_uuid"` // 用户
	Title    string    `db:"title"     json:"title"`     // 标题
	Content  string    `db:"content"   json:"content"`   // 内容
	SendTime time.Time `db:"send_time" json:"send_time"` // 发布时间
	IsPublic bool      `db:"is_public" json:"is_public"` // 公开访问
	IsNotify bool      `db:"is_notify" json:"is_notify"` // 通知用户
	Status   int       `db:"status"    json:"status"`    // 状态
	NRead    int       `db:"nread"     json:"nread"`     // 阅读次数
	NStar    int       `db:"nstar"     json:"nstar"`     // 点赞次数
}

// 通知
type Notification struct {
	UUID     string    `db:"uuid"      json:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at" json:"create_at"` // 创建时间
	UserUUID string    `db:"user_uuid" json:"user_uuid"` // 用户
	Type     int       `db:"type"      json:"type"`      // 类型
	Title    string    `db:"title"     json:"title"`     // 标题
	Content  string    `db:"content"   json:"content"`   // 内容
	Status   int       `db:"status"    json:"status"`    // 状态
	Refer    string    `db:"refer"     json:"refer"`     // 引用
}

// 操作记录
type Ops struct {
	UUID     string    `db:"uuid"      json:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at" json:"create_at"` // 创建时间
	UserUUID string    `db:"user_uuid" json:"user_uuid"` // 用户
	Method   string    `db:"method"    json:"method"`    // 方法
	URL      string    `db:"url"       json:"url"`       // URL
	Body     string    `db:"body"      json:"body"`      // 请求内容
	Audit    string    `db:"audit"     json:"audit"`     // 审计消息
}

// 身份授权设置
type OAuth struct {
	Provider string `db:"provider"  json:"provider"` // 身份提供方
	SortNo   string `db:"sortno"    json:"sortno"`   // 排序序号
	ClientId string `db:"clientid"  json:"clientid"` // 客户端id
	Secret   string `db:"secret"    json:"secret"`   // 客户端密钥
	Enabled  bool   `db:"enabled"   json:"enabled"`  // 启用
}

// 用户授权账号
type UserOAuth struct {
	UUID     string    `db:"uuid"      json:"uuid"`      // uuid
	CreateAt time.Time `db:"create_at" json:"create_at"` // 创建时间
	UserUUID string    `db:"user_uuid" json:"user_uuid"` // 用户
	Provider string    `db:"provider"  json:"provider"`  // 身份提供方
	UserId   string    `db:"userid"    json:"userid"`    // 用户编号
	Email    string    `db:"email"     json:"email"`     // 邮箱地址
	Login    string    `db:"login"     json:"login"`     // 登录名
	Name     string    `db:"name"      json:"name"`      // 用户名
	Avatar   string    `db:"avatar"    json:"avatar"`    // 头像
	Profile  string    `db:"profile"   json:"profile"`   // 用户信息
	Status   int       `db:"status"    json:"status"`    // 状态
	Usage    int       `db:"usage"     json:"usage"`     // 用途
}
