import { useMemo, useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRecoilValue } from 'recoil';
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { zhCN } from '@mui/material/locale';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CssBaseline from "@mui/material/CssBaseline";
import LinearProgress from '@mui/material/LinearProgress';
import { ConfirmProvider } from 'material-ui-confirm';
import { ColorModeContext } from "./hook/colormode";
import titleState from "~/state/title";
import ErrorBoundary from "./error";
import SignUp from "./login/signup";
import SignIn from "./login/signin";
import ResetPass from "./login/resetpass";
import Public from "./public";
import Admin from "./admin";

export default function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const title = useRecoilValue(titleState);

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  }), []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode,
      secondary: {
        main: '#FF1493',
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

  // 更新文档标题
  useEffect(() => { document.title = title; }, [title])

  // 更新色彩模式
  useEffect(() => { setMode(prefersDarkMode ? 'dark' : 'light'); }, [prefersDarkMode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ConfirmProvider defaultOptions={{
            title: '请确认',
            cancellationText: '取消',
            confirmationButtonProps: {
              autoFocus: true, variant: 'contained', sx: { mr: 2, mb: 1 }
            },
            cancellationButtonProps: { sx: { mb: 1 } },
            dialogProps: { maxWidth: 'xs' },
            contentProps: { sx: { '& p': { fontSize: '0.9rem' } } },
            allowClose: false,
          }}>
            <ErrorBoundary>
              <BrowserRouter>
                <Suspense fallback={<LinearProgress />}>
                  <Routes>
                    <Route path='/signin/*' element={<SignIn />} />
                    <Route path='/signup/*' element={<SignUp />} />
                    <Route path='/resetpass/*' element={<ResetPass />} />
                    <Route path='/public/*' element={<Public />} />
                    <Route path='/*' element={<Admin />} />
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
