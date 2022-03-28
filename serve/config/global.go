package config

// debug
func (c *ViperConfig) Debug() bool {
	return c.vp.GetBool("debug")
}
