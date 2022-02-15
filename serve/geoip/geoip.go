package geoip

import (
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"

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

// 通过高德 IP 定位 API 接口查询 IP 对应的地理位置
func AMapLookup(ip string, ipv4 bool) (*Info, error) {
	ql := `select webkey from geoip`
	var webkey string

	// 查询 web key，访问 api 需要 key
	if err := db.SelectOne(ql, &webkey); err != nil {
		return nil, err
	}
	u, err := url.Parse("https://restapi.amap.com/v5/ip")
	if err != nil {
		return nil, err
	}
	params := url.Values{}

	if ipv4 {
		params.Set("type", "4")
	} else {
		params.Set("type", "6")
	}
	params.Set("ip", ip)
	params.Set("key", webkey)

	u.RawQuery = params.Encode()

	// 发送网络请求获取位置信息
	resp, err := http.Get(u.String())
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// 获取响应数据
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	xlog.X.Debugf("高德定位响应: %s", body)

	result := make(map[string]string)

	// 解析响应 json 数据
	if err = json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	// 检查 status，等于 1 表示成功
	status, err := strconv.Atoi(result["status"])
	if err != nil {
		return nil, err
	}
	if status != 1 {
		return nil, fmt.Errorf("%s", result["info"])
	}
	// 解析经纬度
	locations := strings.Split(result["location"], ",")
	lng, lat := 0.0, 0.0

	if len(locations) >= 2 {
		lng, err = strconv.ParseFloat(locations[0], 64)
		if err != nil {
			return nil, err
		}
		lat, err = strconv.ParseFloat(locations[1], 64)
		if err != nil {
			return nil, err
		}
	}
	info := Info{
		Country:   result["country"],
		Province:  result["province"],
		City:      result["city"],
		District:  result["district"],
		ISP:       result["isp"],
		Longitude: lng,
		Latitude:  lat,
	}
	return &info, nil
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
