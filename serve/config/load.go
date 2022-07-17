package config

import (
	"fmt"
	"net/url"
	"os"
	"path"
	"strings"

	"github.com/spf13/viper"
)

type ViperConfig struct {
	Path string
	vp   *viper.Viper
}

// 来自命令行选项
var Master bool = false

// 是否开发模式
var dev = false

// 全局实例
var Config *ViperConfig

func Load(filepath string, master bool) (*ViperConfig, error) {
	vp := viper.NewWithOptions()

	vp.SetDefault("log.path", path.Join(os.TempDir(), "log"))

	if len(filepath) > 0 {
		vp.SetConfigFile(filepath)
	} else {
		vp.SetConfigName("reactgo")
		vp.AddConfigPath(".")
	}
	vp.SetEnvPrefix("reactgo")

	replacer := strings.NewReplacer(".", "_", "-", "_")
	vp.SetEnvKeyReplacer(replacer)

	// 读环境变量
	vp.AutomaticEnv()

	if err := vp.ReadInConfig(); err != nil {
		return nil, err
	}
	if len(filepath) == 0 {
		filepath = vp.ConfigFileUsed()
	}
	config := &ViperConfig{filepath, vp}

	// 检查必须的配置项
	if len(config.LogPath()) == 0 {
		return nil, fmt.Errorf("log.path not found")
	}
	if len(config.DatabaseDSN()) == 0 {
		return nil, fmt.Errorf("database.dsn not found")
	}
	if len(config.ServerHttpURL()) == 0 {
		if err := setHttpURL(config); err != nil {
			return nil, err
		}
	}
	// 设置开发模式
	vp.Set("dev", dev)

	// 设置主服务器标识
	Master = master

	// 设置全局实例
	Config = config

	return config, nil
}

// 如果 server.httpurl 未设置，自动构造一个
func setHttpURL(c *ViperConfig) error {
	domains := c.ServerAutoTLSDomains()
	if len(domains) == 0 {
		return fmt.Errorf("server.httpurl 和 server.autotls.domains 都是空")
	}
	var httpurl url.URL

	if c.ServerSecure() {
		httpurl.Scheme = "https"
	} else {
		httpurl.Scheme = "http"
	}
	bind := c.ServerBind()

	if len(bind) > 0 {
		if !strings.Contains(bind, ":") {
			return fmt.Errorf("server.bind 格式错误，是不是忘了端口前面的冒号?")
		}
		arr := strings.Split(bind, ":")
		port := arr[len(arr)-1]
		httpurl.Host = fmt.Sprintf("%s:%s", domains[0], port)
	} else {
		httpurl.Host = domains[0]
	}
	c.vp.Set("server.httpurl", httpurl.String())

	return nil
}
