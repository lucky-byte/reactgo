package config

// Debug 模式
func (c *ViperConfig) Debug() bool {
	return c.vp.GetBool("debug")
}

// 设置 Debug 模式
func (c *ViperConfig) SetDebug(debug bool) {
	c.vp.Set("debug", debug)
}

// Dev 模式
func (c *ViperConfig) Dev() bool {
	return c.vp.GetBool("dev")
}
