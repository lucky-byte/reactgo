
const urlCodes = {
  911: { title: '导航代码', to: '/codes' },
  1000: { title: '用户管理', to: '/system/user' },
  1100: { title: '访问控制', to: '/system/acl' },
  1200: { title: '登录历史', to: '/system/history' },
  1300: { title: '系统设置', to: '/system/settings' },
  1310: { title: '邮件设置', to: '/system/settings/mail', omit: true },
  1320: { title: '短信设置', to: '/system/settings/sms', omit: true },
  1330: { title: '安全设置', to: '/system/settings/secure', omit: true },
  1400: { title: '事件通知', to: '/system/notification' },
  1500: { title: '定时任务', to: '/system/task' },
  1510: { title: '任务诊断', to: '/system/task/entries', omit: true },
  2000: { title: '用户资料', to: '/user', omit: true },
  2100: { title: '修改密码', to: '/user/password', omit: true },
  2200: { title: '安全设置', to: '/user/security', omit: true },
  2210: { title: '设置安全操作码', to: '/user/security/secretcode', omit: true },
  2220: { title: '设置两因素认证', to: '/user/security/otp', omit: true },

  // 在下面增加业务代码
  100: { title: '看板', to: '/' },
}

export default urlCodes;
