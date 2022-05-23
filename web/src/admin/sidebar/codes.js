// title: 在菜单中展示
// to:    页面地址
// allow: 如果为 true，则该功能不纳入权限控制，即所有登录用户都可以访问
// desc:  进一步的描述
//
const urlCodes = {
  // 查询导航代码
  911:  { 
    title: '导航代码', to: '/codes', allow: true, desc: '列出所有导航码' 
  },

  // 系统功能
  9000: { title: '用户管理', to: '/system/user', desc: '系统用户管理' },
  9010: { title: '访问控制', to: '/system/acl', desc: '系统权限及角色控制' },
  9020: { title: '登录历史', to: '/system/history', desc: '用户登录历史记录' },
  9025: { title: '操作审计', to: '/system/ops', desc: '用户在系统内的操作痕迹' },
  9030: { title: '系统事件', to: '/system/event', desc: '系统内部事件分析' },
  9040: { title: '系统设置', to: '/system/setting', desc: '系统设置汇总' },
  9050: { title: '定时任务', to: '/system/task', desc: '配置定时执行任务' },
  9060: { title: '层级管理', to: '/system/node', desc: '配置上下级结构关系' },
  9070: { title: '系统公告', to: '/system/bulletin', desc: '发布系统公告' },
  9999: { title: '关于系统', to: '/about', allow: true, desc: '系统相关信息' },

  // 用户功能
  8000: { title: '用户资料', to: '/user', allow: true, desc: '用户个人资料' },
  8010: { 
    title: '修改密码', to: '/user/password', allow: true, 
    desc: '用户修改自己的密码' 
  },
  8020: { 
    title: '安全设置', to: '/user/security', allow: true, 
    desc: '用户提高账号安全的措施' 
  },
  8021: { 
    title: '设置安全操作码', to: '/user/security/secretcode', allow: true, 
    desc: '用户设置自己的安全操作码' 
  },
  8022: { 
    title: '设置动态密码', to: '/user/security/otp', allow: true, 
    desc: '用户设置自己的动态密码' 
  },
  8030: { 
    title: '身份授权', to: '/user/oauth', allow: true, 
    desc: '用户授权第三方账号登录' 
  },
  8100: { 
    title: '通知', to: '/user/notification', allow: true, 
    desc: '用户查看自己的通知' 
  },

  // 资源管理
  7100: { title: '图片管理', to: '/media/images' },
  7200: { title: '视频管理', to: '/media/videos' },
  7300: { title: '文档管理', to: '/media/files' },

  // 设计工具
  7500: { title: '页面设计', to: '/designer/page' },
  7600: { title: '流程设计', to: '/designer/flow' },

  // 业务
  100: { title: '欢迎', to: '/' },
  101: { title: '看板', to: '/kanban' },
}

export default urlCodes;
