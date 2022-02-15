package geoip

import (
	"fmt"
	"net"
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
	return AMapLookup(ip, addr.To4() != nil)
}
