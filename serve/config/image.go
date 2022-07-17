package config

// 图片存储位置
func (c *ViperConfig) ImagePlace() int {
	return c.vp.GetInt("image.place")
}

// 设置图片存储位置
func (c *ViperConfig) SetImagePlace(place int) {
	c.vp.Set("image.place", place)
}

// 图片存储文件系统路径
func (c *ViperConfig) ImageRootPath() string {
	return c.vp.GetString("image.rootpath")
}

// 设置图片存储文件系统路径
func (c *ViperConfig) SetImageRootPath(rootpath string) {
	c.vp.Set("image.rootpath", rootpath)
}
