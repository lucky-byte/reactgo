package geoip

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

type tencentResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Result  struct {
		Location struct {
			Lat float64 `json:"lat"`
			Lng float64 `json:"lng"`
		} `json:"location"`
		AdInfo struct {
			Nation   string `json:"nation"`
			Province string `json:"province"`
			City     string `json:"city"`
			District string `json:"district"`
			AdCode   int    `json:"adcode"`
		} `json:"ad_info"`
	} `json:"result"`
}

// 通过腾讯 IP 定位 API 接口查询 IP 对应的地理位置
func TencentLookup(ip string, webkey string) (*Info, error) {
	u, err := url.Parse("https://apis.map.qq.com/ws/location/v1/ip")
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
	xlog.X.Infof("腾讯定位响应: %s", body)

	// result := make(map[string]string)
	var result tencentResponse

	// 解析响应 json 数据
	if err = json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	// 检查 status，等于 0 表示成功
	if result.Status != 0 {
		return nil, fmt.Errorf("%s", result.Message)
	}
	info := Info{
		Country:   result.Result.AdInfo.Nation,
		Province:  result.Result.AdInfo.Province,
		City:      result.Result.AdInfo.City,
		District:  result.Result.AdInfo.District,
		Longitude: result.Result.Location.Lng,
		Latitude:  result.Result.Location.Lat,
	}
	return &info, nil
}
