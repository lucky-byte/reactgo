import { useMemo, useState, createContext, useContext, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { zhCN } from '@mui/material/locale';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterDayjs';
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfirmProvider } from 'material-ui-confirm';
import SignIn from "./signin";
import SignInSMS from "./signin/sms";
import SignInOTP from "./signin/otp";
import ResetPass from "./resetpass";
import ResetPassSMS from "./resetpass/sms";
import ResetPassSuccess from "./resetpass/success";
import Index from "./route";

const ColorModeContext = createContext({ toggleColorMode: () => {} });
export const useColorModeContent = () => useContext(ColorModeContext);

export default function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');

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
