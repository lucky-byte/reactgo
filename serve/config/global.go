package config

// debug
func (c *ViperConfig) Debug() bool {
	return c.vp.GetBool("debug")
}

// proxy
func (c *ViperConfig) Proxy() bool {
	return c.vp.GetBool("proxy")
}

// webdir
func (c *ViperConfig) Webdir() string {
	return c.vp.GetString("webdir")
}
