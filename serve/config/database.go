package config

// database.driver
func (c *ViperConfig) DatabaseDriver() string {
	return c.vp.GetString("database.driver")
}

// database.dsn
func (c *ViperConfig) DatabaseDSN() string {
	return c.vp.GetString("database.dsn")
}
