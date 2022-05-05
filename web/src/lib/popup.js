export default function popupWindow(url, title, w, h) {
  const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
  const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);

  return window.open(url, title, `
    toolbar=no,
    location=no,
    directories=no,
    status=no,
    menubar=no,
    width=${w},
    height=${h},
    top=${y},
    left=${x}
  `);
}
