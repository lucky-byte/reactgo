package user

import (
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

type conflictRecord struct {
	db.TreeBind
	NodeName string `db:"node_name" json:"node_name"`
	UserName string `db:"user_name" json:"user_name"`
}

// 绑定用户
func add(c echo.Context) error {
	cc := c.(*ctx.Context)

	var node, user string
	var force bool

	err := echo.FormFieldBinder(c).
		MustString("node", &node).
		MustBool("force", &force).
		MustString("users", &user).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	users := strings.Split(user, ",")

	// 检查用户是否已经绑定到其它节点
	conflictList, err := conflict(users)
	if err != nil {
		cc.ErrLog(err).Error("查询绑定用户冲突错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 如果有冲突，返回让用户确认
	if !force {
		if len(conflictList) > 0 {
			return c.JSON(http.StatusOK, echo.Map{
				"conflict": true, "list": conflictList,
			})
		}
	}
	// 绑定用户
	ql := `insert into tree_bind (uuid, node, entity, type) values (?,?,?,1)`

	tx, err := db.Default().Beginx()
	if err != nil {
		cc.ErrLog(err).Error("启动数据库事务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	for _, u := range users {
		// 如果存在冲突，则先解除绑定
		for _, f := range conflictList {
			if f.Entity == u {
				ql2 := `delete from tree_bind where entity = ? and type = 1`

				res, err := tx.Exec(tx.Rebind(ql2), u)
				if err != nil {
					tx.Rollback()
					cc.ErrLog(err).Error("解除用户绑定错")
					return c.NoContent(http.StatusInternalServerError)
				}
				if err = db.MustAffected1Row(res, ql2); err != nil {
					tx.Rollback()
					cc.ErrLog(err).Error("解除用户绑定错")
					return c.NoContent(http.StatusInternalServerError)
				}
				break
			}
		}
		res, err := tx.Exec(tx.Rebind(ql), uuid.NewString(), node, u)
		if err != nil {
			tx.Rollback()
			cc.ErrLog(err).Error("绑定用户错")
			return c.NoContent(http.StatusInternalServerError)
		}
		if err = db.MustAffected1Row(res, ql); err != nil {
			tx.Rollback()
			cc.ErrLog(err).Error("绑定用户错")
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	tx.Commit()

	return c.NoContent(http.StatusOK)
}

// 检查用户是否已经绑定到其它节点
func conflict(users []string) ([]conflictRecord, error) {
	ql := `
		select tb.*,
			coalesce(u.name, '') as user_name,
			coalesce(t.name, '') as node_name
		from tree_bind as tb
		left join users as u on u.uuid = tb.entity
		left join tree as t on t.uuid = tb.node
		where tb.entity in (?) and tb.type = 1
	`
	var result []conflictRecord

	ql, args, err := db.In(ql, users)
	if err != nil {
		return nil, err
	}
	if err = db.Select(ql, &result, args...); err != nil {
		return nil, err
	}
	return result, nil
}
