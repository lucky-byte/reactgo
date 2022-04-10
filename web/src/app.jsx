import { useMemo, useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRecoilValue } from 'recoil';
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { zhCN } from '@mui/material/locale';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterDayjs';
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import LinearProgress from '@mui/material/LinearProgress';
import { ConfirmProvider } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import Push from 'push.js';
import nats from '~/lib/nats';
import userState from "./state/user";
import { ColorModeContext } from "./hook/colormode";
import { get } from "~/rest";
import ErrorBoundary from "./error";
import SignIn from "./signin";
import ResetPass from "./resetpass";
import Index from "./route";

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
    if (!user || !user.activate) {
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
          const sub = broker.subscribe("reactgo.system.event")
          const codec = await nats.JSONCodec();

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
                    <IconButton onClick={() => {
                      closeSnackbar();
                      window.location.href = '/system/event';
                    }}>
                      <MoreHorizIcon sx={{ color: 'white' }} />
                    </IconButton>
                    <IconButton onClick={() => { closeSnackbar() }}>
                      <CloseIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </>
                )
              });
              // web 通知
              if (Push.Permission.has()) {
                Push.create(event.title, {
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
            <ErrorBoundary>
              <BrowserRouter>
                <Suspense fallback={<LinearProgress />}>
                  <Routes>
                    <Route path='/signin/*' element={<SignIn />} />
                    <Route path='/resetpass/*' element={<ResetPass />} />
                    <Route path='/*' element={<Index />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ErrorBoundary>
          </ConfirmProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
