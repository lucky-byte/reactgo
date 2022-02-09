package db

import (
	"log"

	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
)

type Pagination struct {
	Table   exp.IdentifierExpression
	selects []interface{}
	where   []exp.Expression
	orderby []exp.OrderedExpression
	offset  uint
	limit   uint
}

func NewPagination(table string, offset, limit uint) *Pagination {
	return &Pagination{
		Table:  goqu.T(table),
		offset: offset,
		limit:  limit,
	}
}

// 返回 "table.column" 而不是 "column"，在连表查询时，应该用这个指定表名，
// 单表查询无所谓，用 goqu.C() 就可以
func (p *Pagination) Col(col interface{}) exp.IdentifierExpression {
	return p.Table.Col(col)
}

// 用这个函数指定查询列，例如 * 或者 goqu.C("name") 或者 p.Col("name")，分别是:
// select * from
// select name from
// select table.name from
//
// 可以指定多列
func (p *Pagination) Select(columns ...interface{}) *Pagination {
	p.selects = columns
	return p
}

// 添加 where 子句，多个条件以 and 结合，和使用 goqu.And() 的效果一样
func (p *Pagination) Where(conds ...exp.Expression) *Pagination {
	p.where = conds
	return p
}

// 添加 order by 子句，可以指定多个，例如:
// OrderBy(goqu.Col("serial").Desc(), goqu.Col("create_at").Asc())
// 注意使用 Desc() 和 Asc()
func (p *Pagination) OrderBy(order ...exp.OrderedExpression) *Pagination {
	p.orderby = order
	return p
}

// 这个函数执行 2 个 SQL 查询，第一次查询表的总数，第二次查询当前的分页数据
// 这个函数应该在上面的条件都准备好之后调用
func (p *Pagination) Exec(count *uint, records interface{}) error {
	b := goqu.From(p.Table).Select(goqu.COUNT('*')).Where(p.where...)

	ql1, _, err := b.ToSQL()
	if err != nil {
		return err
	}
	log.Printf("sql: %s\n", ql1)

	b = goqu.From(p.Table).Select(p.selects...).Where(p.where...).
		Order(p.orderby...).
		Offset(p.offset).Limit(uint(p.limit))

	ql2, _, err := b.ToSQL()
	if err != nil {
		return err
	}
	log.Printf("sql: %s\n", ql2)

	// 查询总数
	if err = SelectOne(ql1, count); err != nil {
		return err
	}
	// 查询分页记录
	return Select(ql2, records)
}
