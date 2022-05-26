/**
 * 以简单的形式显示国家/省/市/区中的一部分
 */
export const location = r => {
  // 如果有区，则显示 市/区
  if (r.district) {
    if (r.district === r.city) {
      return r.district;
    }
    return r.city + r.district;
  }
  // 如果有城市，显示 省/市
  if (r.city) {
    if (r.province === r.city) {
      return r.city;
    }
    return r.province + r.city;
  }
  // 显示 国家/省
  if (r.country === r.province) {
    return r.province;
  }
  return r.country + r.province;
}
