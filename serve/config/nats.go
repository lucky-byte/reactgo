package config

// nats.servers
func (c *ViperConfig) NatsServers() []string {
	return c.vp.GetStringSlice("nats.servers")
}

// nats.websocket
func (c *ViperConfig) NatsWebSocket() []string {
	return c.vp.GetStringSlice("nats.websocket")
}
