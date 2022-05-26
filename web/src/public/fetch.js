import { rest } from '~/lib/rest';

// 这组函数访问后台公共服务，以 '/pubacc' 作为前缀
//
const prefix = '/pubacc'
const redirect401 = false;

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
