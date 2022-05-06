const ignores = [
  '/signin',
  '/resetpass',
]

// 获取最后访问页面的
function getLastAccess() {
  let last = localStorage.getItem('last-access');
  if (!last) {
    return '/';
  }
  localStorage.removeItem('last-access');

  for (let i = 0; i < ignores.length; i++) {
    if (last.startsWith(ignores[i])) {
      return '/';
    }
  }
  return last;
}

// 设置最后访问页面
function setLastAccess(path) {
  localStorage.setItem('last-access', path);
}

export { getLastAccess, setLastAccess }
