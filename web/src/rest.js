import Cookies from 'universal-cookie';

/**
 * Async Rest request
 */
const rest = async (url, args) => {
  const cookies = new Cookies();

  const csrf = cookies.get('csrf');
  const token = localStorage.getItem('token');

  const resp = await fetch('/r' + url, {
    method: args.method,
    headers: {
      'x-user-agent': 'ReactGo/1',
      'x-csrf-token': csrf || '',
      'x-auth-token': token || '',
    },
    body: args.body,
    credentials: "same-origin",
    cache: "no-store",
    redirect: "follow",
  });
  if (!resp.ok) {
    // 认证失败，跳转到登录页面
    if (resp.status === 401) {
      cookies.remove('csrf');
      localStorage.removeItem('token');
      localStorage.setItem('last-access', window.location.pathname);
      setTimeout(() => { window.location.href = '/signin'; }, 500);
      throw new Error('认证失败，请重新登录');
    }
    // 显示错误消息
    let text = await resp.text();
    if (!text) {
      text = resp.statusText;
    }
    throw new Error(text || '未知错误-' + resp.status);
  }
  // 根据返回类型解析数据，支持 json，其它类型作为 text 处理
  const type = resp.headers.get("content-type");
  if (type?.startsWith("application/json")) {
    return await resp.json();
  }
  return await resp.text();
};

// GET
export const get = async (url) => {
  return await rest(url, { method: "GET" });
};

// DELETE
export const del = async (url) => {
  return await rest(url, { method: "DELETE" });
};

// POST
export const post = async (url, body) => {
  return await rest(url, { method: "POST", body: body });
};

// PUT
export const put = async (url, body) => {
  return await rest(url, { method: "PUT", body: body });
};
