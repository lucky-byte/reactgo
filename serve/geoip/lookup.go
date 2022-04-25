package geoip

import (
	"fmt"
	"net"

	"github.com/lucky-byte/reactgo/serve/db"
)

type Info struct {
	Country   string
	Province  string
	City      string
	District  string
	ISP       string
	Longitude float64
	Latitude  float64
}

// 通过 IP 查询地理位置
func Lookup(ip string) (*Info, error) {
	addr := net.ParseIP(ip)
	if addr == nil {
		return nil, fmt.Errorf("%s 不是有效的 ip 地址", ip)
	}
	if addr.IsLoopback() {
		return &Info{City: "本机"}, nil
	}
	if addr.IsPrivate() {
		return &Info{City: "局域网"}, nil
	}
	ql := `select * from geoip`
	var r db.GeoIP

	// 查询 web key，访问 api 需要 key
	if err := db.SelectOne(ql, &r); err != nil {
		return nil, err
	}
	if len(r.AMapWebKey) == 0 {
		return nil, fmt.Errorf("未配置 IP 定位 WEB 服务 KEY")
	}
	if r.AMapApiVer == "v3" {
		return AMapLookupV3(ip, r.AMapWebKey)
	}
	// 该接口 2022.4.30 下线
	return AMapLookupV5(ip, addr.To4() != nil, r.AMapWebKey)
}
