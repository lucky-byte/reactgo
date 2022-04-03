import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useRecoilState } from "recoil"
import { useLocation, useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import Checkbox from '@mui/material/Checkbox';
import KeyIcon from '@mui/icons-material/Key';
import { useSnackbar } from 'notistack';
import Banner from '~/img/banner.png';
import BannerDark from '~/img/banner-dark.png';
import userState from "~/state/user";
import { post, put } from "~/rest";

export default function SignInSMS() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useRecoilState(userState);
  const { enqueueSnackbar } = useSnackbar();
  const [clientId, setClientId] = useState('');
  const [historyId, setHistoryId] = useState('');
  const [smsid, setSmsid] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(60);

  const Logo = theme.palette.mode === 'dark' ? BannerDark : Banner;

  useEffect(() => { document.title = '短信验证'; }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user || !user.userid) {
      return navigate('/signin', { replace: true });
    }
    if (!location?.state?.smsid) {
      return navigate('/signin', { replace: true });
    }
    setSmsid(location.state.smsid);
    setHistoryId(location?.state?.historyid || '');
  }, [user, navigate, location?.state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (time > 0) {
        setTime(time - 1);
      } else {
        clearTimeout(timer);
      }
    }, 1000);
    return () => { clearTimeout(timer); }
  }, [time]);

  const onCodeChange = e => {
    setCode(e.target.value);
  }

  const onCodeKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  // 信任设备
  const onTrustCheck = e => {
    if (e.target.checked) {
      setClientId(localStorage.getItem('client-id'));
    } else {
      setClientId('');
    }
  }

  // 提交认证
  const onSubmit = async () => {
    if (code.length !== 6) {
      return enqueueSnackbar('请输入完整的短信验证码', {
        variant: 'warning', preventDuplicate: true,
      });
    }
    try {
      setLoading(true);

      const resp = await put('/signin/smsverify', new URLSearchParams({
        smsid, code, historyid: historyId, clientid: clientId,
      }));
      if (!resp || !resp.token) {
        return enqueueSnackbar('服务器响应数据不完整', { variant: 'error' });
      }
      // 保存新的 token
      localStorage.setItem('token', resp.token);

      // 更新用户信息
      setUser({ ...user, activate: true });

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

  // 重新发送验证码
  const onReSendClick = async () => {
    try {
      const resp = await post('/signin/smsresend');
      if (!resp.smsid) {
        throw new Error('响应数据无效');
      }
      setSmsid(resp.smsid);
      setTime(60);
    } catch (err) {
      enqueueSnackbar(err.message)
    }
  }

  // 切换到 TOTP 认证
  const onSwitchOTP = () => {
    navigate('../otp', {
      state: {
        tfa: true, historyid: historyId,
      }
    });
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
          <Typography as='h1' variant="h6">短信认证</Typography>
          <Typography variant='caption' sx={{ mt: 1 }}>
            短信验证码已发送到手机号 ****{user?.mobile?.substring(7)}，
            请输入短信中的验证码完成验证
          </Typography>
          <FormControl fullWidth sx={{ mt: 3 }}>
            <TextField required autoFocus autoComplete="off"
              label='短信验证码' placeholder="请输入短信验证码"
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
            {time > 0 ?
              <FormHelperText sx={{ mx: 0, my: 1 }}>
                没有收到验证码？请等待 {time} 秒后尝试重新获取，如尝试多次无效，
                请联系管理员协助处理。
                {user?.totp_isset &&
                  <Link underline="hover" onClick={onSwitchOTP}
                    sx={{ cursor: 'pointer' }}>
                    或切换到 TOTP 认证
                  </Link>
                }
              </FormHelperText>
              :
              <Button sx={{ mt: 1 }} color='warning' onClick={onReSendClick}>
                重新获取验证码
              </Button>
            }
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={clientId.length > 0}
                onChange={onTrustCheck}
                inputProps={{ 'aria-label': '信任当前设备' }}
              />
            }
            label='信任当前使用的设备'
          />
          <Button fullWidth variant="contained" size="large" sx={{ mt: 4 }}
            onClick={onSubmit} disabled={loading}>
            验证
          </Button>
        </Paper>
      </Container>
    </Stack>
  )
}
