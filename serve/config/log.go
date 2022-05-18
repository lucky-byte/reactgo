package config

// log.path 日志文件路径
func (c *ViperConfig) LogPath() string {
	return tildeExpand(c.vp.GetString("log.path"))
}

// log.publish
func (c *ViperConfig) LogPublish() string {
	return c.vp.GetString("log.publish")
}

// log.airbrake_pid
func (c *ViperConfig) LogAirbrakePid() int64 {
	return c.vp.GetInt64("log.airbrake_pid")
}

// log.airbrake_key
func (c *ViperConfig) LogAirbrakeKey() string {
	return c.vp.GetString("log.airbrake_key")
}
