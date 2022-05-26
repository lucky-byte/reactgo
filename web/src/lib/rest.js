import Cookies from 'universal-cookie';
import { setLastAccess } from './last-access';

/**
 * 异步 HTTP 请求
 * prefix 在 path 前增加前缀路径
 */
const rest = async (prefix, path, redirect401, args) => {
  const cookies = new Cookies();

  const csrf = cookies.get('csrf');
  const token = localStorage.getItem('token');

  const resp = await fetch(prefix + path, {
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
    // 认证失败，如果需要的话自动跳转到登录页面
    if (redirect401) {
      if (resp.status === 401) {
        cookies.remove('csrf');
        localStorage.clear();

        // 保存当前访问的页面地址，下次登录可以回来
        setLastAccess(window.location.pathname);

        // 跳转到登录页面
        setTimeout(() => { window.location.href = '/signin'; }, 500);
        throw new Error('认证失败，请重新登录');
      }
    }
    // 显示错误消息
    let text = await resp.text();
    if (!text) {
      text = resp.statusText;
    }
    // http2 不再有 statusText
    if (!text) {
      text = statusTexts[resp.status];
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

export { rest };

// 这组函数访问后台管理服务，以 '/admin' 作为前缀，如果返回 401 错误，则跳转到登录页面
//
const prefix = '/admin'
const redirect401 = true;

export const get = async path => {
  return await rest(prefix, path, redirect401, { method: "GET" });
};

export const del = async path => {
  return await rest(prefix, path, redirect401, { method: "DELETE" });
};

export const post = async (path, body) => {
  return await rest(prefix, path, redirect401, { method: "POST", body: body });
};

export const put = async (path, body) => {
  return await rest(prefix, path, redirect401, { method: "PUT", body: body });
};

// HTTP 状态码消息
const statusTexts = {
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
  300: "多个选择(300 Multiple Choices)",
  301: "持久性的转移(301 Moved Permanently)",
  302: "找到了(302 Found)",
  303: "看其他的(303 See Other)",
  304: "没有修改(304 Not Modified)",
  305: "使用代理(305 Use Proxy)",
  307: "临时的重定向(307 Temporary Redirect)",
  308: "持久的重定向(308 Permanent Redirect)",
  400: "无效的请求(400 Bad Request)",
  401: "未授权(401 Unauthorized)",
  402: "需求付费(402 Payment Required)",
  403: "禁止访问(403 Forbidden)",
  404: "未找到(404 Not Found)",
  405: "方法不允许(405 Method Not Allowed)",
  406: "不可接受(406 Not Acceptable)",
  407: "需要代理认证(407 Proxy Authentication Required)",
  408: "请求超时(408 Request Timeout)",
  409: "冲突(409 Conflict)",
  410: "跑了(410 Gone)",
  411: "需要长度(411 Length Required)",
  412: "先决条件不满足(412 Precondition Failed)",
  413: "负载太大(413 Payload Too Large)",
  414: "URI太长(414 URI Too Long)",
  415: "不支持的媒体类型(415 Unsupported Media Type)",
  416: "区间不满足(416 Range Not Satisfiable)",
  417: "预期的失败(417 Expectation Failed)",
  418: "我是茶壶(418 I'm a Teapot)",
  421: "迷失方向的请求(421 Misdirected Request)",
  422: "不可处理的实体(422 Unprocessable Entity)",
  423: "锁住了(423 Locked)",
  424: "错误的依赖(424 Failed Dependency)",
  425: "太早了(425 Too Early)",
  426: "需要升级(426 Upgrade Required)",
  428: "需要先决条件(428 Precondition Required)",
  429: "太多的请求(429 Too Many Requests)",
  431: "请求首部字段太大(431 Request Header Fields Too Large)",
  451: "因为合法性原因而无效(451 Unavailable For Legal Reasons)",
  500: "内部服务器错误(500 Internal Server Error)",
  501: "未实现(501 Not Implemented)",
  502: "错误的网关(502 Bad Gateway)",
  503: "服务无效(503 Service Unavailable)",
  504: "网关超市(504 Gateway Timeout)",
  505: "HTTP 版本不支持(505 HTTP Version Not Supported)",
  506: "变元也参与协商(506 Variant Also Negotiates)",
  507: "不满足的存储(507 Insufficient Storage)",
  508: "检测到循环(508 Loop Detected)",
  509: "超出带宽限制(Bandwidth Limit Exceeded)",
  510: "不可扩展(510 Not Extended)",
  511: "需要网络认证(511 Network Authentication Required)",
};
