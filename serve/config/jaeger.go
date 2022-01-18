package config

// jaeger.enabled
func (c *ViperConfig) JaegerEnabled() bool {
	return c.vp.GetBool("jaeger.enabled")
}
