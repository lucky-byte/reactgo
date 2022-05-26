import { rest } from '~/lib/rest';

// 这组函数访问后台登录等服务，以 '/login' 作为前缀
//
const prefix = '/login'
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
