import React from 'react';
import ReactDOM from 'react-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { RecoilRoot } from 'recoil';
import { SnackbarProvider } from 'notistack';
import Slide from '@mui/material/Slide';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import App from './app';

dayjs.locale('zh-cn');

// 某些第三方模块(react-pin-input)大量打印 debug 日志
if (process.env.NODE_ENV === 'production') {
  window.console.debug = function(){}
}

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <SnackbarProvider maxSnack={3} variant='error'
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}>
        <App />
      </SnackbarProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);
