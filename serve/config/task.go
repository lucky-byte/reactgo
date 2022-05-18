package config

// task.path
func (c *ViperConfig) TaskPath() string {
	return tildeExpand(c.vp.GetString("task.path"))
}

// task.env
func (c *ViperConfig) TaskEnv() map[string]string {
	return c.vp.GetStringMapString("task.env")
}
