import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useRecoilValue } from "recoil"
import { useLocation, useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import KeyIcon from '@mui/icons-material/Key';
import { useSnackbar } from 'notistack';
import Banner from '~/img/banner.png';
import BannerDark from '~/img/banner-dark.png';
import userState from "~/state/user";
import { put, post } from "~/rest";

export default function SignInOTP() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useRecoilValue(userState);
  const { enqueueSnackbar } = useSnackbar();
  const [tfa, setTFA] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const Logo = theme.palette.mode === 'dark' ? BannerDark : Banner;

  useEffect(() => { document.title = '两因素认证'; }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user || !user.userid) {
      return navigate('/signin', { replace: true });
    }
    setTFA(location?.state?.tfa || false);
  }, [user, navigate, location?.state]);

  const onCodeChange = e => {
    setCode(e.target.value);
  }

  const onCodeKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  const onSubmit = async () => {
    if (code.length !== 6) {
      return enqueueSnackbar('请输入完整的口令', {
        variant: 'warning', preventDuplicate: true,
      });
    }
    try {
      setLoading(true);

      const resp = await put('/signin/otpverify', new URLSearchParams({ code }));
      if (!resp || !resp.token) {
        return enqueueSnackbar('响应数据不完整', { variant: 'error' });
      }
      localStorage.setItem('token', resp.token);

      setLoading(false);

      // 跳转到最近访问页面
      let last = localStorage.getItem('last-access');
      if (last?.startsWith('/signin') || last?.startsWith('/resetpass')) {
        last = '/';
      }
      localStorage.removeItem('last-access');
      navigate(last || '/', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 切换到短信认证
  const onSwitchSMS = async () => {
    try {
      const resp = await post('/signin/smsresend');
      if (!resp.smsid) {
        throw new Error('响应数据无效');
      }
      navigate('/signin/sms', { state: { smsid: resp.smsid } });
    } catch (err) {
      enqueueSnackbar(err.message)
    }
  }

  return (
    <Stack as='main' role='main'>
      <Toolbar>
        <Box sx={{ flex: 1 }}>
          <Link component='a' href='/signin'>
            <img src={Logo} alt='Logo' height='28px' />
          </Link>
        </Box>
      </Toolbar>
      <Container maxWidth='xs'
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ mt: 6, py: 3, px: 4, width: '100%' }}>
          <Typography as='h1' variant="h6">两因素认证</Typography>
          <Typography variant='caption' sx={{ mt: 1 }}>
            请输入 6 位 TOTP 数字口令完成认证
          </Typography>
          <FormControl fullWidth sx={{ mt: 3 }}>
            <TextField required autoFocus autoComplete="off"
              label='TOTP 口令' placeholder="请输入 6 位口令"
              variant='outlined' value={code} onChange={onCodeChange}
              onKeyDown={onCodeKeyDown}
              inputProps={{ maxLength: 6, minLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormHelperText sx={{ mx: 0, my: 1 }}>
              您可以在手机 TOTP 客户端中查看认证口令，如无法访问，请联系管理员协助处理。
              {tfa &&
                <Link underline="hover" onClick={onSwitchSMS}
                  sx={{ cursor: 'pointer' }}>
                  或切换到短信验证码认证
                </Link>
              }
            </FormHelperText>
          </FormControl>
          <Button fullWidth variant="contained" size="large" sx={{ mt: 4 }}
            onClick={onSubmit} disabled={loading}>
            验证
          </Button>
        </Paper>
      </Container>
    </Stack>
  )
}
