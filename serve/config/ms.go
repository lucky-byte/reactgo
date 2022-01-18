package config

// ms.brokers
func (c *ViperConfig) MSBrokers() []string {
	return c.vp.GetStringSlice("ms.brokers")
}
