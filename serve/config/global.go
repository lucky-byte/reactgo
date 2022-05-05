package config

// Debug 模式
func (c *ViperConfig) Debug() bool {
	return c.vp.GetBool("debug")
}

// Dev 模式
func (c *ViperConfig) Dev() bool {
	return c.vp.GetBool("dev")
}
