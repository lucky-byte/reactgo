package config

// server.httpurl
func (c *ViperConfig) ServerHttpURL() string {
	return c.vp.GetString("server.httpurl")
}

// server.bind
func (c *ViperConfig) ServerBind() string {
	return c.vp.GetString("server.bind")
}

// server.secure
func (c *ViperConfig) ServerSecure() bool {
	return c.vp.GetBool("server.secure")
}

// server.autotls.enabled
func (c *ViperConfig) ServerAutoTLSEnabled() bool {
	return c.vp.GetBool("server.autotls.enabled")
}

// server.autotls.domains
func (c *ViperConfig) ServerAutoTLSDomains() []string {
	return c.vp.GetStringSlice("server.autotls.domains")
}

// server.autotls.email
func (c *ViperConfig) ServerAutoTLSEmail() string {
	return c.vp.GetString("server.autotls.email")
}

// server.autotls.cachedir
func (c *ViperConfig) ServerAutoTLSCachedir() string {
	return c.vp.GetString("server.autotls.cachedir")
}

// server.tlskey
func (c *ViperConfig) ServerTLSKey() string {
	return c.vp.GetString("server.tlskey")
}

// server.tlscrt
func (c *ViperConfig) ServerTLSCrt() string {
	return c.vp.GetString("server.tlscrt")
}

// server.session.store
func (c *ViperConfig) ServerSessionStore() string {
	return c.vp.GetString("server.session.store")
}
