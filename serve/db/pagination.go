package db

import (
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

type paginationJoin struct {
	table exp.Expression
	on    exp.JoinCondition
}

type Pagination struct {
	Table   exp.IdentifierExpression
	selects []any
	where   []exp.Expression
	order   []exp.OrderedExpression
	join    []paginationJoin
	offset  uint
	limit   uint
}

func NewPagination(table string, offset, limit uint) *Pagination {
	return &Pagination{
		Table:   goqu.T(table),
		selects: make([]any, 0),
		where:   make([]exp.Expression, 0),
		order:   make([]exp.OrderedExpression, 0),
		join:    make([]paginationJoin, 0),
		offset:  offset,
		limit:   limit,
	}
}

// 返回 "table.column" 而不是 "column"，在连表查询时，应该用这个指定表名，
// 单表查询无所谓，用 goqu.C() 就可以
func (p *Pagination) Col(col any) exp.IdentifierExpression {
	return p.Table.Col(col)
}

// 用这个函数指定查询列，例如 * 或者 goqu.C("name") 或者 p.Col("name")，分别是:
// select * from
// select name from
// select table.name from
//
// 可以指定多列，也可以多次调用该函数来添加列
func (p *Pagination) Select(columns ...any) *Pagination {
	p.selects = append(p.selects, columns...)
	return p
}

// 添加 where 子句，多个条件以 and 结合，和使用 goqu.And() 的效果一样
//
// 可以多次调用该函数增加查询条件(and 组合)
func (p *Pagination) Where(conds ...exp.Expression) *Pagination {
	p.where = append(p.where, conds...)
	return p
}

// 添加 order by 子句，可以指定多个，例如:
// OrderBy(goqu.Col("serial").Desc(), goqu.Col("create_at").Asc())
// 注意使用 Desc() 和 Asc()
//
// 可以多次调用该函数添加多个 order by 子句
func (p *Pagination) OrderBy(order ...exp.OrderedExpression) *Pagination {
	p.order = append(p.order, order...)
	return p
}

// 添加 left join，大致用法如下(on 有多种方式):
// p.Join(goqu.T('t2'), goqu.On(t1.col.eq(t2.col)))
//
// 可以多次调用该函数联合多个表
func (p *Pagination) Join(t exp.Expression, on exp.JoinCondition) *Pagination {
	p.join = append(p.join, paginationJoin{t, on})
	return p
}

// 这个函数执行 2 个 SQL 查询，第一次查询表的总数，第二次查询当前的分页数据
// 这个函数应该在上面的条件都准备好之后调用
func (p *Pagination) Exec(count *uint, records any) error {
	b1 := From(p.Table).Select(goqu.COUNT("*"))
	for _, j := range p.join {
		b1 = b1.LeftJoin(j.table, j.on)
	}
	b1 = b1.Where(p.where...)

	q1, _, err := b1.ToSQL()
	if err != nil {
		return err
	}

	b2 := From(p.Table).Select(p.selects...)
	for _, j := range p.join {
		b2 = b2.LeftJoin(j.table, j.on)
	}
	b2 = b2.Where(p.where...).Order(p.order...).Offset(p.offset).Limit(uint(p.limit))

	q2, _, err := b2.ToSQL()
	if err != nil {
		return err
	}
	xlog.X.Debugf("SQL: %s", q2)

	// 查询总数
	if err = SelectOne(q1, count); err != nil {
		return err
	}
	// 查询分页记录
	return Select(q2, records)
}
