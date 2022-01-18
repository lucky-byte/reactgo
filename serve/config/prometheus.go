package config

// prometheus
func (c *ViperConfig) Prometheus() bool {
	return c.vp.GetBool("prometheus")
}
