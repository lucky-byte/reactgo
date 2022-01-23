package signin

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
	"github.com/lucky-byte/bdb/serve/route/index/auth"
	"github.com/lucky-byte/bdb/serve/secure"
	"github.com/lucky-byte/bdb/serve/sms"
)

func signin(c echo.Context) error {
	cc := c.(*ctx.Context)

	var username, password string

	err := echo.FormFieldBinder(c).
		MustString("username", &username).
		MustString("password", &password).BindError()
	if err != nil {
		return c.String(http.StatusBadRequest, "无效的请求")
	}
	var user db.User

	ql := `select * from users where userid = ?`

	// 查询用户信息
	if err = db.SelectOne(ql, &user, username); err != nil {
		cc.ErrLog(err).WithField("userid", username).Error("登录失败")
		return c.String(http.StatusForbidden, "用户名或密码错误")
	}
	// 检查用户状态
	if user.Disabled || user.Deleted {
		cc.Log().WithField("userid", username).Error("用户已被禁用或删除，登录失败")
		return c.String(http.StatusForbidden, "不允许登录")
	}
	// 验证密码
	phc, err := secure.ParsePHC(user.Passwd)
	if err != nil {
		cc.ErrLog(err).WithField("userid", username).Error("登录失败")
		return c.String(http.StatusForbidden, "登录名或密码错误")
	}
	if err = phc.Verify(password); err != nil {
		cc.ErrLog(err).WithField("userid", username).Error("登录失败")
		return c.String(http.StatusForbidden, "登录名或密码错误")
	}
	newJwt := auth.NewAuthJWT(user.UUID, true, 12*time.Hour)

	// 如果需要2步认证，则设置为未激活的 token
	if user.TFA {
		newJwt.Activate = false
		newJwt.ExpiresAt = &jwt.NumericDate{Time: time.Now().Add(10 * time.Minute)}
	}
	// 生成 JWT
	token, err := auth.JWTGenerate(newJwt)
	if err != nil {
		cc.ErrLog(err).WithField("userid", username).Error("登录失败")
		return c.String(http.StatusForbidden, "服务器内部错")
	}
	smsid := ""

	// 发送短信验证码
	if user.TFA {
		if smsid, err = sms.Code(user.Mobile); err != nil {
			cc.ErrLog(err).WithField("userid", username).Error(
				"发送短信验证码错误，登录失败")
			return c.String(http.StatusInternalServerError, "发送短信验证码失败")
		}
	}
	// 更新用户信息
	ql = `
		update users set
			signin_at = current_timestamp, n_signin = n_signin + 1
		where uuid = ?
	`
	if err = db.ExecOne(ql, user.UUID); err != nil {
		cc.ErrLog(err).Error("更新用户最后登录时间错")
	}
	// 查询用户访问控制
	ql = `select code, read, write, admin from acl_allows where acl = ?`
	var result []db.ACLAllow

	if err = db.Select(ql, &result, user.ACL); err != nil {
		cc.ErrLog(err).Error("查询用户访问控制错误")
		return c.NoContent(http.StatusInternalServerError)
	}
	allows := []echo.Map{}

	for _, v := range result {
		allows = append(allows, echo.Map{
			"code":  v.Code,
			"read":  v.Read,
			"write": v.Write,
			"admin": v.Admin,
		})
	}
	// 记录登录历史
	ql = `
		insert into signin_history (uuid, user_uuid, userid, name, ip, ua)
		values (?, ?, ?, ?, ?, ?)
	`
	err = db.ExecOne(ql, uuid.NewString(),
		user.UUID, user.UserId, user.Name, c.RealIP(), c.Request().UserAgent())
	if err != nil {
		cc.ErrLog(err).Error("登记用户登录历史错误")
	}

	return c.JSON(http.StatusOK, echo.Map{
		"userid": user.UserId,
		"name":   user.Name,
		"mobile": user.Mobile,
		"email":  user.Email,
		"tfa":    user.TFA,
		"allows": allows,
		"smsid":  smsid,
		"token":  token,
	})
}
