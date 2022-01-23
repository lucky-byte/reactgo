
const urlCodes = {
  911: { title: '导航代码', to: '/codes' },
  1000: { title: '用户管理', to: '/system/user' },
  1100: { title: '访问控制', to: '/system/acl' },
  1200: { title: '登录历史', to: '/system/history' },
  1300: { title: '系统设置', to: '/system/settings' },
  1400: { title: '系统事件', to: '/system/notification' },
  1500: { title: '定时任务', to: '/system/task' },

  // 在下面增加业务代码
  100: { title: '看板', to: '/' },
}

export default urlCodes;
