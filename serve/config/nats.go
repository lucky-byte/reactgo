package config

// nats.servers
func (c *ViperConfig) NatsServers() []string {
	return c.vp.GetStringSlice("nats.servers")
}
