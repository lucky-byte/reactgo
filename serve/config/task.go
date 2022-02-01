package config

// task.path
func (c *ViperConfig) TaskPath() string {
	return c.vp.GetString("task.path")
}
