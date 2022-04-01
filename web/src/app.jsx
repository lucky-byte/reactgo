import { useMemo, useState, createContext, useContext, useEffect } from "react";
import { useRecoilValue } from 'recoil';
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { zhCN } from '@mui/material/locale';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterDayjs';
import CssBaseline from "@mui/material/CssBaseline";
import Button from '@mui/material/Button';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfirmProvider } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import Push from 'push.js';
import userState from "./state/user";
import SignIn from "./signin";
import SignInSMS from "./signin/sms";
import SignInOTP from "./signin/otp";
import ResetPass from "./resetpass";
import ResetPassSMS from "./resetpass/sms";
import ResetPassSuccess from "./resetpass/success";
import Index from "./route";
import nats from '~/lib/nats';
import { get } from "~/rest";

const ColorModeContext = createContext({ toggleColorMode: () => {} });
export const useColorModeContent = () => useContext(ColorModeContext);

export default function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  }), []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode,
      secondary: {
        main: '#ff00af',
      },
    },
    components: {
      // 给 Typography 增加 disabled 风格
      MuiTypography: {
        styleOverrides: {
          root: ({ ownerState, theme }) => {
            if (ownerState.disabled) {
              return {
                color: theme.palette.text.disabled,
                pointerEvents: 'none',
              }
            }
          },
        }
      },
      // 给表格行增加 disabled 和 deleted 风格
      MuiTableRow: {
        styleOverrides: {
          root: ({ ownerState, theme }) => {
            if (ownerState.deleted === 'true') {
              return {
                textDecoration: 'line-through',
                color: theme.palette.error.main,
                '& td:not(.action)': {
                  color: theme.palette.text.disabled,
                  pointerEvents: 'none',
                },
              }
            }
            if (ownerState.disabled) {
              return {
                '& td:not(.action)': {
                  color: theme.palette.text.disabled,
                  pointerEvents: 'none',
                },
              }
            }
          },
        }
      }
    }
  }, zhCN), [mode]);

  // 更新色彩模式
  useEffect(() => { setMode(prefersDarkMode ? 'dark' : 'light'); }, [prefersDarkMode]);

  // 连接 nats 服务器，接收事件通知
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    if (!user) {
      return;
    }
    (async () => {
      try {
        // 获取 nats 服务器配置
        const resp = await get('/nats');
        if (!resp.servers) {
          return enqueueSnackbar('未配置消息通道，不能接收异步通知', { variant: 'info' });
        }
        // 连接服务器
        const broker = await nats.open(resp.servers, resp.name);

        let event_allow = false;

        // 检查用户是否有事件访问权限
        for (let i = 0; i < user?.allows?.length; i++) {
          if (user.allows[i].code === 9040) {
            event_allow = true;
            break;
          }
        }
        // 如果用户具有事件访问权限，则订阅事件
        if (event_allow) {
          const sub = broker.subscribe("event")
          const codec = nats.JSONCodec();

          // 收到事件时弹出提示
          for await (const m of sub) {
            const event = codec.decode(m.data);
            if (event.title) {
              const variants = ['success', 'info', 'warning', 'error']
              const variant = variants[parseInt(event.level)] || 'default';

              enqueueSnackbar(event.title, {
                variant: variant,
                preventDuplicate: true,
                autoHideDuration: 10000,
                anchorOrigin: {
                  horizontal: 'right',
                  vertical: 'top',
                },
                action: (
                  <>
                    <Button sx={{ color: 'white' }} onClick={() => {
                      closeSnackbar();
                      // navigate('/system/event');
                      window.location.href = '/system/event';
                    }}>
                      查看
                    </Button>
                  </>
                )
              });
              // web 通知
              if (Push.Permission.has()) {
                Push.create(`[${variant}] ${event.title}`, {
                  timeout: 1000 * 600,
                  vibrate: [200, 100, 200, 100],
                  link: '/system/event',
                  body: '点击查看详情',
                  icon: '/logo192.png',
                  onClick: () => {},
                });
              }
            }
          }
        }
      } catch (err) {
        enqueueSnackbar(err.message || '连接消息通道失败');
      }
    })();

    // 关闭连接
    return async () => {
      await nats.close();
    }
  }, [enqueueSnackbar, closeSnackbar, user]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={DateAdapter}>
          <ConfirmProvider defaultOptions={{
            title: '请确认',
            cancellationText: '取消',
            confirmationButtonProps: {
              variant: 'contained', sx: { mr: 2, mb: 1 }
            },
            cancellationButtonProps: { sx: { mb: 1 } },
            dialogProps: { maxWidth: 'xs' },
            allowClose: false,
          }}>
            <BrowserRouter>
              <Routes>
                <Route path='/signin' element={<SignIn />} />
                <Route path='/signin/sms' element={<SignInSMS />} />
                <Route path='/signin/otp' element={<SignInOTP />} />
                <Route path='/resetpass' element={<ResetPass />} />
                <Route path='/resetpass/sms' element={<ResetPassSMS />} />
                <Route path='/resetpass/success' element={<ResetPassSuccess />} />
                <Route path='/*' element={<Index />} />
              </Routes>
            </BrowserRouter>
          </ConfirmProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
