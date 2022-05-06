import Cookies from 'universal-cookie';

/**
 * 异步 HTTP 请求
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
      localStorage.clear();
      localStorage.setItem('last-access', window.location.pathname);
      setTimeout(() => { window.location.href = '/signin'; }, 500);
      throw new Error('认证失败，请重新登录');
    }
    // 显示错误消息
    let text = await resp.text();
    if (!text) {
      text = resp.statusText;
    }
    // http2 不再有 statusText
    if (!text) {
      text = status[resp.status];
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

// HTTP 状态码消息
const status = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a Teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  509: "Bandwidth Limit Exceeded",
  510: "Not Extended",
  511: "Network Authentication Required",
};
