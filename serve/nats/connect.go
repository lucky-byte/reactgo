package nats

import (
	"strings"

	"github.com/nats-io/nats.go"
	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/config"
)

var Broker *nats.EncodedConn = nil

// 连接 nats 服务器
func Connect(conf *config.ViperConfig) error {
	servers := conf.NatsServers()
	if len(servers) == 0 {
		return nil
	}
	url := strings.Join(servers, ",")
	var err error = nil
	conn, err := nats.Connect(url)
	if err != nil {
		return errors.Wrapf(err, "连接 nats 服务器(%s)失败", url)
	}
	Broker, err = nats.NewEncodedConn(conn, nats.JSON_ENCODER)
	if err != nil {
		return errors.Wrap(err, "建立 nats 编码连接错")
	}
	return nil
}

func Drain() {
	if Broker != nil {
		Broker.Drain()
	}
}
