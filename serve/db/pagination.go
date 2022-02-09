package db

import (
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/sirupsen/logrus"
)

type paginationJoin struct {
	table exp.Expression
	on    exp.JoinCondition
}

type Pagination struct {
	Table   exp.IdentifierExpression
	selects []interface{}
	where   []exp.Expression
	orderby []exp.OrderedExpression
	join    []paginationJoin
	offset  uint
	limit   uint
}

func NewPagination(table string, offset, limit uint) *Pagination {
	return &Pagination{
		Table:   goqu.T(table),
		selects: make([]interface{}, 0),
		where:   make([]exp.Expression, 0),
		orderby: make([]exp.OrderedExpression, 0),
		join:    make([]paginationJoin, 0),
		offset:  offset,
		limit:   limit,
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
	p.selects = append(p.selects, columns...)
	return p
}

// 添加 where 子句，多个条件以 and 结合，和使用 goqu.And() 的效果一样
func (p *Pagination) Where(conds ...exp.Expression) *Pagination {
	p.where = append(p.where, conds...)
	return p
}

// 添加 order by 子句，可以指定多个，例如:
// OrderBy(goqu.Col("serial").Desc(), goqu.Col("create_at").Asc())
// 注意使用 Desc() 和 Asc()
func (p *Pagination) OrderBy(order ...exp.OrderedExpression) *Pagination {
	p.orderby = append(p.orderby, order...)
	return p
}

// 添加 left join，大致用法如下(on 有多种方式):
// p.Join(goqu.T('t2'), goqu.On(t1.col.eq(t2.col)))
func (p *Pagination) Join(t exp.Expression, on exp.JoinCondition) *Pagination {
	p.join = append(p.join, paginationJoin{t, on})
	return p
}

// 这个函数执行 2 个 SQL 查询，第一次查询表的总数，第二次查询当前的分页数据
// 这个函数应该在上面的条件都准备好之后调用
func (p *Pagination) Exec(count *uint, records interface{}) error {
	b1 := goqu.From(p.Table).Select(goqu.COUNT('*')).Where(p.where...)

	q1, _, err := b1.ToSQL()
	if err != nil {
		return err
	}
	logrus.Debugf("SQL: %s", q1)

	b2 := goqu.From(p.Table).Select(p.selects...)
	for _, j := range p.join {
		b2 = b2.LeftJoin(j.table, j.on)
	}
	b2 = b2.Where(p.where...).Order(p.orderby...).
		Offset(p.offset).Limit(uint(p.limit))

	q2, _, err := b2.ToSQL()
	if err != nil {
		return err
	}
	logrus.Debugf("SQL: %s", q2)

	// 查询总数
	if err = SelectOne(q1, count); err != nil {
		return err
	}
	// 查询分页记录
	return Select(q2, records)
}
