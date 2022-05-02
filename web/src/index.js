import React from 'react';
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { RecoilRoot } from 'recoil';
import { SnackbarProvider } from 'notistack';
import Zoom from '@mui/material/Zoom';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import App from './app';

// dayjs locale 和插件配置
dayjs.locale('zh-cn');
dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// 某些第三方模块(react-pin-input)大量打印 debug 日志
if (process.env.NODE_ENV === 'production') {
  window.console.debug = function(){}
}

function Root() {
  return (
    <React.StrictMode>
      <RecoilRoot>
        <SnackbarProvider
          maxSnack={3}
          variant='error'
          preventDuplicate
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          TransitionComponent={Zoom}>
          <App />
        </SnackbarProvider>
      </RecoilRoot>
    </React.StrictMode>
  )
}
const container = document.getElementById('root');

// React 17
// ReactDOM.render(<Root/>, container);

// React 18
const root = createRoot(container);
root.render(<Root />)

// const reportWebVitals = onPerfEntry => {
//   if (onPerfEntry && onPerfEntry instanceof Function) {
//     import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
//       getCLS(onPerfEntry);
//       getFID(onPerfEntry);
//       getFCP(onPerfEntry);
//       getLCP(onPerfEntry);
//       getTTFB(onPerfEntry);
//     });
//   }
// };

// function sendToAnalytics(metric) {
//   const body = JSON.stringify(metric);

//   // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
//   (navigator.sendBeacon && navigator.sendBeacon('/analytics', body)) ||
//     fetch('/analytics', {body, method: 'POST', keepalive: true});
// }

// reportWebVitals(sendToAnalytics);
