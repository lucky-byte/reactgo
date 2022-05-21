package login

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/geoip"
	"github.com/lucky-byte/reactgo/serve/route/lib/jwt2"
	"github.com/lucky-byte/reactgo/serve/sms"
)

func Login(c echo.Context, user *db.User, clientid string, acttype int, oauthp string) error {
	cc := c.(*ctx.Context)

	// 日志增加用户信息
	cc.SetUser(user)

	// 检查用户状态
	if user.Disabled || user.Deleted {
		cc.Log().Errorf("用户 %s 已被禁用或删除, 不允许登录", user.Name)
		return c.String(http.StatusForbidden, "账号状态异常")
	}
	// 查询用户访问控制角色是否含有 nologin 特征，如果有则不允许登录
	ql := `select features from acl where uuid = ?`
	var acl db.ACL

	err := db.SelectOne(ql, &acl, user.ACL)
	if err != nil {
		cc.ErrLog(err).Errorf("查询用户 %s 访问控制信息错", user.Name)
		return c.NoContent(http.StatusInternalServerError)
	}
	acl_features := strings.Split(acl.Features, ",")

	for _, feature := range acl_features {
		trimed := strings.TrimSpace(feature)

		if trimed == "nologin" {
			err = fmt.Errorf("访问控制角色 %s 含有 nologin 特征", acl.Name)
			cc.ErrLog(err).Errorf("用户 %s 所属角色不允许登录", user.Name)
			return c.String(http.StatusForbidden, "该账号不允许登录")
		}
	}
	// 从账号设置中查询会话持续时间
	ql = `select sessduration from account`
	var duration time.Duration

	err = db.SelectOne(ql, &duration)
	if err != nil {
		cc.ErrLog(err).Error("查询账号设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	newJwt := jwt2.NewAuthJWT(user.UUID, true, duration*time.Minute)
	smsid := ""

	// 查询登录历史是否有受信任的 client id，如果有则表示当前设备受信任，不需要2步认证
	// client id 存储在客户端，有可能被窃取
	ql = `
		select count(*) from signin_history
		where user_uuid = ? and clientid = ? and trust = true and create_at > ?
	`
	var count int

	since := time.Now().AddDate(0, 0, -7) // 7 天之内
	err = db.SelectOne(ql, &count, user.UUID, clientid, since)
	if err != nil {
		cc.ErrLog(err).Error("查询登录历史错")
		return c.NoContent(http.StatusInternalServerError)
	}
	trust := count > 0

	// 非信任模式下，如果开启了短信认证或者设置了 TOTP，需要进入两因素认证
	if !trust {
		if user.TFA || len(user.TOTPSecret) > 0 {
			// JWT 设置为未激活，有效期设置为 10 分钟
			newJwt.Activate = false
			newJwt.ExpiresAt = &jwt.NumericDate{Time: time.Now().Add(10 * time.Minute)}

			// 如果没有设置 TOTP，则发送短信验证码
			if len(user.TOTPSecret) == 0 {
				smsid, err = sms.SendCode(user.Mobile)
				if err != nil {
					cc.ErrLog(err).Errorf("%s 登录失败, 发送短信验证码错", user.Name)
					return c.String(http.StatusInternalServerError, "发送短信验证码失败")
				}
			}
		}
	}
	// 生成 JWT
	token, err := jwt2.JWTGenerate(newJwt)
	if err != nil {
		cc.ErrLog(err).Errorf("%s 登录失败, 生成 JWT 错", user.Name)
		return c.NoContent(http.StatusInternalServerError)
	}
	// 更新用户信息
	ql = `
		update users set signin_at = current_timestamp, n_signin = n_signin + 1
		where uuid = ?
	`
	// 这里更新出错不用返回失败
	if err = db.ExecOne(ql, user.UUID); err != nil {
		cc.ErrLog(err).Error("更新用户最后登录时间错")
	}

	// 记录登录历史
	geoInfo, err := geoip.Lookup(cc.RealIP()) // 查询 IP 位置
	if err != nil {
		cc.ErrLog(err).Error("记录登录历史时查询 IP 地理位置错")
		geoInfo = new(geoip.Info)
	}
	historyid := uuid.NewString()

	ql = `
		insert into signin_history (
			uuid, user_uuid, userid, name, ip, country, province, city,
			district, longitude, latitude, ua, clientid, trust, act_type, oauthp
		) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	err = db.ExecOne(ql,
		historyid,
		user.UUID,
		user.UserId,
		user.Name,
		cc.RealIP(),
		geoInfo.Country,
		geoInfo.Province,
		geoInfo.City,
		geoInfo.District,
		geoInfo.Longitude,
		geoInfo.Latitude,
		cc.Request().UserAgent(),
		clientid,
		trust,
		acttype,
		oauthp,
	)
	if err != nil {
		cc.ErrLog(err).Error("登记用户登录历史错误")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"mobile":     user.Mobile,
		"tfa":        user.TFA,
		"totp_isset": len(user.TOTPSecret) > 0,
		"smsid":      smsid,
		"token":      token,
		"trust":      trust,
		"historyid":  historyid,
		"activate":   newJwt.Activate,
	})
}
