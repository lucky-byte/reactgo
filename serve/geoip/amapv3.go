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

type amapLookupV3Response struct {
	Status    int    `json:"status,string"`
	Info      string `json:"info"`
	InfoCode  int    `json:"infocode,string"`
	Province  any    `json:"province"`
	City      any    `json:"city"`
	Adcode    any    `json:"adcode"`
	Rectangle any    `json:"rectangle"`
}

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
	xlog.X.Infof("高德定位响应: %s", body)

	var result amapLookupV3Response

	// 解析响应 json 数据
	if err = json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	if result.Status != 1 {
		return nil, fmt.Errorf("%s", result.Info)
	}
	// 解析经纬度
	lng, lat := 0.0, 0.0

	rect, ok := result.Rectangle.(string)
	if ok {
		rectangle := strings.Split(rect, ";")
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
	}
	province, _ := result.Province.(string)
	city, _ := result.City.(string)

	info := Info{
		Province:  province,
		City:      city,
		Longitude: lng,
		Latitude:  lat,
	}
	return &info, nil
}
