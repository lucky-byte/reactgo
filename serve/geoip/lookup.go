package geoip

import (
	"fmt"
	"net"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
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
	var config db.GeoIP

	if err := db.SelectOne(ql, &config); err != nil {
		return nil, err
	}
	// 高德定位
	if config.AMapEnable {
		info, err := lookupAMap(&config, addr)
		if err == nil {
			if len(info.City) > 0 {
				return info, nil
			} else {
				xlog.X.Infof("高德定位IP %s 返回无结果", ip)
			}
		}
		xlog.X.WithError(err).Error("使用高德定位失败")
	}
	// 使用腾讯定位
	if config.TencentEnable {
		if len(config.TencentWebKey) == 0 {
			return nil, fmt.Errorf("未配置腾讯定位 WebKey")
		}
		info, err := TencentLookup(ip, config.TencentWebKey)
		if err == nil {
			return info, nil
		}
		xlog.X.WithError(err).Error("使用高德定位失败")
	}
	return nil, fmt.Errorf("没有更多可用的定位服务")
}

func lookupAMap(config *db.GeoIP, addr net.IP) (*Info, error) {
	if len(config.AMapWebKey) == 0 {
		return nil, fmt.Errorf("未配置高德定位 WebKey")
	}
	if config.AMapApiVer == "v3" {
		return AMapLookupV3(addr.String(), config.AMapWebKey)
	}
	// 该接口 2022.4.30 下线
	return AMapLookupV5(addr.String(), addr.To4() != nil, config.AMapWebKey)
}
