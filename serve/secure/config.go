package secure

import (
	"os"

	"gopkg.in/yaml.v3"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

type SConfiguration struct {
	PCHID string `yaml:"pchid"` // Password hash algorithm
}

// Load secure configuration from file
func LoadConfig(path string) error {
	file, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var sc SConfiguration

	if err := yaml.Unmarshal(file, &sc); err != nil {
		return err
	}

	// Default password hash algorithm
	if len(sc.PCHID) > 0 {
		xlog.X.Infof("Change default password hash to %s", sc.PCHID)
		SetDefaultPHC(sc.PCHID)
	}
	return nil
}
