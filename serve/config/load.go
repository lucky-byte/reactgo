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

func Load(filepath string) (*ViperConfig, error) {
	vp := viper.NewWithOptions()

	vp.SetDefault("log.path", path.Join(os.TempDir(), "bdb-log"))

	if len(filepath) > 0 {
		vp.SetConfigFile(filepath)
	} else {
		vp.SetConfigName("bdb")
		vp.AddConfigPath(".")
	}
	vp.SetEnvPrefix("bdb")

	replacer := strings.NewReplacer(".", "_", "-", "_")
	vp.SetEnvKeyReplacer(replacer)

	// auto read environment
	vp.AutomaticEnv()

	if err := vp.ReadInConfig(); err != nil {
		return nil, err
	}
	if len(filepath) == 0 {
		filepath = vp.ConfigFileUsed()
	}
	config := &ViperConfig{filepath, vp}

	// check required configuration entries
	if len(config.LogPath()) == 0 {
		return nil, fmt.Errorf("log.path not found")
	}
	if len(config.DatabaseDriver()) == 0 {
		return nil, fmt.Errorf("database.driver not found")
	}
	if len(config.DatabaseDSN()) == 0 {
		return nil, fmt.Errorf("database.dsn not found")
	}
	if len(config.MSBrokers()) == 0 {
		return nil, fmt.Errorf("ms.brokers cannot be empty")
	}
	if len(config.ServerHttpURL()) == 0 {
		if err := setHttpurl(config); err != nil {
			return nil, err
		}
	}
	return config, nil
}

// contract server.httpurl if it is empty
func setHttpurl(c *ViperConfig) error {
	domains := c.ServerDomains()
	if len(domains) == 0 {
		return fmt.Errorf("both server.httpurl and server.domains is empty")
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
			return fmt.Errorf(
				"server.bind unrecognizable, did you missing colon before port?",
			)
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
