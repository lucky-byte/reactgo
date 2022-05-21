package node

import (
	"crypto/md5"
	"encoding/hex"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 添加子节点
func add(c echo.Context) error {
	cc := c.(*ctx.Context)

	id := c.FormValue("uuid")
	if len(id) == 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `select * from tree where uuid = ?`
	var node db.Tree

	if err := db.SelectOne(ql, &node, id); err != nil {
		cc.ErrLog(err).Error("查询层次结构错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql = `
		select coalesce(max(sortno),0) from tree where nlevel = ? and tpath like ?
	`
	var maxSortNo int

	err := db.SelectOne(ql, &maxSortNo, node.NLevel+1, node.TPath+"%")
	if err != nil {
		cc.ErrLog(err).Error("查询层次结构错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql = `
		insert into tree (
			uuid, name, summary, up, tpath, tpath_hash, nlevel, sortno
		) values (
			?, ?, ?, ?, ?, ?, ?, ?
		)
	`
	newid := uuid.NewString()
	tpath := node.TPath + "." + newid
	sum := md5.Sum([]byte(tpath))
	hash := hex.EncodeToString(sum[:])

	err = db.ExecOne(ql,
		newid, "新节点", "新节点说明", id, tpath, hash, node.NLevel+1, maxSortNo+1,
	)
	if err != nil {
		cc.ErrLog(err).Error("插入层次结构错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{"uuid": newid})
}
