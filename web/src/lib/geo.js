// 显示登录位置
export const geo = r => {
  if (r.district) {
    if (r.district === r.city) {
      return r.district;
    }
    return r.city + r.district;
  }
  if (r.city) {
    if (r.province === r.city) {
      return r.city;
    }
    return r.province + r.city;
  }
  if (r.country === r.province) {
    return r.province;
  }
  return r.country + r.province;
}
