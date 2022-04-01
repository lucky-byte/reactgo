import React from 'react';
import ReactDOM from 'react-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { RecoilRoot } from 'recoil';
import { SnackbarProvider } from 'notistack';
import Zoom from '@mui/material/Zoom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import App from './app';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

// 某些第三方模块(react-pin-input)大量打印 debug 日志
if (process.env.NODE_ENV === 'production') {
  window.console.debug = function(){}
}

ReactDOM.render(
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
  </React.StrictMode>,
  document.getElementById('root')
);
