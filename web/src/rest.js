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
      ...args.headers,
      'X-User-Agent': 'BDB/1',
      'X-CSRF-Token': csrf || '',
      'X-AUTH-Token': token || '',
    },
    body: args.body,
    credentials: "same-origin",
    cache: "no-store",
    redirect: "follow",
  });
  if (!resp.ok) {
    if (resp.status === 401) {
      localStorage.removeItem('token');
      cookies.remove('csrf');
      localStorage.setItem('last-access', window.location.pathname);
      setTimeout(() => { window.location.href = '/signin'; }, 500);
      throw new Error('认证失败，请重新登录');
    }
    let text = await resp.text();
    if (!text) {
      text = resp.statusText;
    }
    throw new Error(text || '未知错误-' + resp.status);
  }
  const restype = resp.headers.get("content-type");
  if (restype?.startsWith("application/json")) {
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
