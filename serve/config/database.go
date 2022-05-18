package config

// database.driver
func (c *ViperConfig) DatabaseDriver() string {
	return c.vp.GetString("database.driver")
}

// database.dsn
func (c *ViperConfig) DatabaseDSN() string {
	p := c.vp.GetString("database.dsn")

	if c.DatabaseDriver() == "sqlite" || c.DatabaseDriver() == "sqlite3" {
		p = tildeExpand(p)
	}
	return p
}
