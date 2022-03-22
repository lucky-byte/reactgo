package geoip

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 通过高德 IP 定位 API 接口查询 IP 对应的地理位置
func AMapLookupV3(ip string, webkey string) (*Info, error) {
	u, err := url.Parse("https://restapi.amap.com/v3/ip")
	if err != nil {
		return nil, err
	}
	params := url.Values{}

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
	lng, lat := 0.0, 0.0

	rectangle := strings.Split(result["rectangle"], ";")
	if len(rectangle) > 1 {
		locations := strings.Split(rectangle[0], ",")
		if len(locations) >= 2 {
			lng, err = strconv.ParseFloat(locations[0], 64)
			if err != nil {
				xlog.X.WithError(err).Warnf("查询 IP(%s) 位置解析精度错", ip)
				lng = 0.0
			}
			lat, err = strconv.ParseFloat(locations[1], 64)
			if err != nil {
				xlog.X.WithError(err).Warnf("查询 IP(%s) 位置解析纬度错", ip)
				lat = 0.0
			}
		}
	}
	info := Info{
		Province:  result["province"],
		City:      result["city"],
		Longitude: lng,
		Latitude:  lat,
	}
	return &info, nil
}
