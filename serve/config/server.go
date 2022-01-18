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

// server.autotls
func (c *ViperConfig) ServerAutoTLS() bool {
	return c.vp.GetBool("server.autotls")
}

// server.domains
func (c *ViperConfig) ServerDomains() []string {
	return c.vp.GetStringSlice("server.domains")
}

// server.cachedir
func (c *ViperConfig) ServerCachedir() string {
	return c.vp.GetString("server.cachedir")
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
