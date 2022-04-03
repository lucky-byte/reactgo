package signin

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/geoip"
	"github.com/lucky-byte/reactgo/serve/route/index/auth"
	"github.com/lucky-byte/reactgo/serve/secure"
	"github.com/lucky-byte/reactgo/serve/sms"
)

// 用户登录
func signin(c echo.Context) error {
	cc := c.(*ctx.Context)

	var username, password, clientid string

	err := echo.FormFieldBinder(c).
		MustString("username", &username).
		MustString("password", &password).
		MustString("clientid", &clientid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&username, &clientid)

	ql := `select * from users where userid = ?`
	var user db.User

	// 查询用户信息
	if err = db.SelectOne(ql, &user, username); err != nil {
		cc.ErrLog(err).Errorf("登录失败, 用户 %s 不存在", username)
		return c.String(http.StatusForbidden, "用户名或密码错误")
	}
	// 这里的主要作用是给日志增加 user 和 userid 字段
	cc.SetUser(&user)

	// 检查用户状态
	if user.Disabled || user.Deleted {
		cc.Log().Errorf("用户 %s 已被禁用或删除, 不允许登录", user.Name)
		return c.String(http.StatusForbidden, "不允许登录")
	}
	// 验证密码
	phc, err := secure.ParsePHC(user.Passwd)
	if err != nil {
		cc.ErrLog(err).Errorf("%s 登录失败, 解析用户密码错", user.Name)
		return c.String(http.StatusForbidden, "登录名或密码错误")
	}
	if err = phc.Verify(password); err != nil {
		cc.ErrLog(err).Errorf("%s 登录失败, 验证登录密码错", user.Name)
		return c.String(http.StatusForbidden, "登录名或密码错误")
	}
	// 从设置中查询会话保持时间
	ql = `select token_duration from settings`
	var duration time.Duration

	if err = db.SelectOne(ql, &duration); err != nil {
		cc.ErrLog(err).Error("查询系统设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	newJwt := auth.NewAuthJWT(user.UUID, true, duration*time.Minute)
	smsid := ""

	// 查询登录历史是否有 client id，如果有则表示当前设备受信任，不需要2步认证
	ql = `
		select count(*) from signin_history
		where user_uuid = ? and clientid = ? and create_at > ?
	`
	var count int

	db.SelectOne(ql, &count, user.UUID, clientid, time.Now().AddDate(0, 0, -7))
	if err != nil {
		cc.ErrLog(err).Error("查询登录历史错")
		return c.NoContent(http.StatusInternalServerError)
	}
	trust := count > 0

	if !trust {
		// 如果开启了短信认证或者设置了 TOTP，需要进入两因素认证
		if user.TFA || len(user.TOTPSecret) > 0 {
			// 设置为未激活，JWT 有效期设置为 10 分钟
			newJwt.Activate = false
			newJwt.ExpiresAt = &jwt.NumericDate{Time: time.Now().Add(10 * time.Minute)}

			// 如果没有设置 TOTP，则发送短信验证码
			if len(user.TOTPSecret) == 0 {
				if smsid, err = sms.SendCode(user.Mobile); err != nil {
					cc.ErrLog(err).Errorf("%s 登录失败, 发送短信验证码错", user.Name)
					return c.String(http.StatusInternalServerError, "发送短信验证码失败")
				}
			}
		}
	}
	// 生成 JWT
	token, err := auth.JWTGenerate(newJwt)
	if err != nil {
		cc.ErrLog(err).Errorf("%s 登录失败, 生成 JWT 错", user.Name)
		return c.String(http.StatusForbidden, "服务器内部错")
	}
	// 更新用户信息
	ql = `
		update users set
			signin_at = current_timestamp, n_signin = n_signin + 1
		where uuid = ?
	`
	// 这里更新出错不用返回失败
	if err = db.ExecOne(ql, user.UUID); err != nil {
		cc.ErrLog(err).Error("更新用户最后登录时间错")
	}

	// 查询用户访问控制
	ql = `select code, iread, iwrite, iadmin from acl_allows where acl = ?`
	var result []db.ACLAllow

	if err = db.Select(ql, &result, user.ACL); err != nil {
		cc.ErrLog(err).Errorf("查询用户 %s 访问控制错误", user.Name)
		return c.NoContent(http.StatusInternalServerError)
	}
	allows := []echo.Map{}

	for _, v := range result {
		allows = append(allows, echo.Map{
			"code":   v.Code,
			"iread":  v.IRead,
			"iwrite": v.IWrite,
			"iadmin": v.IAdmin,
		})
	}
	// 记录登录历史
	historyid := addSignInHistory(c, &user, trust, clientid)

	return c.JSON(http.StatusOK, echo.Map{
		"userid":           user.UserId,
		"avatar":           user.Avatar,
		"name":             user.Name,
		"email":            user.Email,
		"mobile":           user.Mobile,
		"address":          user.Address.String,
		"tfa":              user.TFA,
		"secretcode_isset": len(user.SecretCode) > 0,
		"totp_isset":       len(user.TOTPSecret) > 0,
		"allows":           allows,
		"smsid":            smsid,
		"token":            token,
		"trust":            trust,
		"historyid":        historyid,
		"activate":         newJwt.Activate,
	})
}

// 记录登录历史
func addSignInHistory(c echo.Context, user *db.User, trust bool, clientid string) string {
	cc := c.(*ctx.Context)

	// 查询 IP 位置
	info, err := geoip.Lookup(c.RealIP())
	if err != nil {
		cc.ErrLog(err).Error("查询 IP 地理位置错")
		info = new(geoip.Info)
	}
	// 如果当前设备不被信任，则记入随机值
	if !trust {
		clientid = uuid.NewString()
	}
	historyid := uuid.NewString()

	ql := `
		insert into signin_history (
			uuid, user_uuid, userid, name, ip, country, province, city,
			district, longitude, latitude, ua, clientid, trust
		) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	err = db.ExecOne(ql,
		historyid,
		user.UUID,
		user.UserId,
		user.Name,
		c.RealIP(),
		info.Country,
		info.Province,
		info.City,
		info.District,
		info.Longitude,
		info.Latitude,
		c.Request().UserAgent(),
		clientid,
		trust,
	)
	if err != nil {
		cc.ErrLog(err).Error("登记用户登录历史错误")
		return ""
	}
	return historyid
}
