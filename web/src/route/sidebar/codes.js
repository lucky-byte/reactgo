const urlCodes = {
  // 查询导航代码
  911:  { title: '导航代码', to: '/codes', omit: true },

  // 系统功能
  9000: { title: '用户管理', to: '/system/user' },
  9010: { title: '访问控制', to: '/system/acl' },
  9020: { title: '登录历史', to: '/system/history' },
  9030: { title: '系统设置', to: '/system/settings' },
  9031: { title: '邮件设置', to: '/system/settings/mail', omit: true },
  9032: { title: '短信设置', to: '/system/settings/sms', omit: true },
  9033: { title: '安全设置', to: '/system/settings/secure', omit: true },
  9040: { title: '系统事件', to: '/system/event' },
  9050: { title: '定时任务', to: '/system/task' },
  9051: { title: '任务诊断', to: '/system/task/entries', omit: true },
  9060: { title: '层级管理', to: '/system/node' },
  9070: { title: '发布公告', to: '/system/bulletin' },

  // 用户设置
  8000: { title: '用户资料', to: '/user', omit: true },
  8010: { title: '修改密码', to: '/user/password', omit: true },
  8020: { title: '安全设置', to: '/user/security', omit: true },
  8021: { title: '设置安全操作码', to: '/user/security/secretcode', omit: true },
  8022: { title: '设置两因素认证', to: '/user/security/otp', omit: true },

  // 资源管理
  8100: { title: '图片管理', to: '/media/images' },
  8200: { title: '视频管理', to: '/media/videos' },

  // 下面自定义业务
  100: { title: '欢迎', to: '/' },
  101: { title: '看板', to: '/kanban' },
}

export default urlCodes;
