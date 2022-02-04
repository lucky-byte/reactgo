import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil"
import { useTheme } from "@mui/material/styles";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import { useSnackbar } from 'notistack';
import Banner from '~/img/banner.png';
import BannerDark from '~/img/banner-dark.png';
import userState from "~/state/user";
import { put, get } from "~/rest";

export default function SignIn() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setUser = useSetRecoilState(userState);
  const [resetpass, setResetpass] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHide, setPasswordHide] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const Logo = theme.palette.mode === 'dark' ? BannerDark : Banner;

  useEffect(() => { document.title = '请登录'; }, []);

  // 查询系统设置
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await get('/signin/settings')
        setResetpass(resp.resetpass);
        setLoading(false);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  // 登录名改变
  const onUsernameChange = e => {
    setUsername(e.target.value);
  }

  // 密码改变
  const onPasswordChange = e => {
    setPassword(e.target.value);
  }

  // 密码框回车
  const onPasswordKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  // 提交认证
  const onSubmit = async () => {
    if (!username || !password) {
      return enqueueSnackbar('请输入登录信息', {
        variant: 'warning', preventDuplicate: true,
      });
    }
    try {
      setSubmitting(true);

      const resp = await put('/signin/', new URLSearchParams({ username, password }));
      setSubmitting(false);

      if (!resp || !resp.token) {
        throw new Error('响应数据无效');
      }
      localStorage.setItem('token', resp.token);

      // 保存用户信息到全局状态
      setUser({
        userid: resp.userid,
        name: resp.name,
        email: resp.email,
        mobile: resp.mobile,
        address: resp.address,
        secretcode_isset: resp.secretcode_isset,
        totp_isset: resp.totp_isset,
        allows: resp.allows,
      });

      // 如果设置了 TOTP，则进入 TOTP 认证
      if (resp.totp_isset) {
        return navigate('/signin/otp');
      }
      // 如果设置了短信认证，则进入短信认证
      if (resp.tfa) {
        if (!resp.smsid) {
          return enqueueSnackbar('响应数据不完整', { variant: 'error' });
        }
        return navigate('/signin/sms', { state: { smsid: resp.smsid } });
      }
      // 跳转到最近访问页面
      let last = localStorage.getItem('last-access');
      if (last?.startsWith('/signin') || last.startsWith('/resetpass')) {
        last = '/';
      }
      localStorage.removeItem('last-access');
      navigate(last || '/', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Stack as='main' role='main'>
      <Toolbar>
        <img src={Logo} alt='Logo' height='28px' />
      </Toolbar>
      <Container maxWidth='xs'
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ mt: 8, py: 3, px: 4, width: '100%' }}>
          <Typography as='h1' variant='h6' sx={{ mt: 1 }}>欢迎，请登录</Typography>
          <TextField required label='登录名' placeholder="请输入登录名"
            fullWidth autoComplete="username"
            variant='standard' value={username} onChange={onUsernameChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 3 }}
          />
          <TextField required label='密码' placeholder="请输入登录密码"
            fullWidth autoComplete="password"
            variant='standard' type={passwordHide ? 'password' : 'text'}
            value={password} onChange={onPasswordChange}
            onKeyDown={onPasswordKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size='small' onClick={() => {
                    setPasswordHide(!passwordHide);
                  }}>
                    {passwordHide ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mt: 4 }}
          />
          {resetpass ?
            <FormHelperText sx={{ mt: 1, textAlign: 'right' }}>
              <Link component={RouteLink} to='/resetpass' underline="hover">
                忘记登录密码？
              </Link>
            </FormHelperText>
            :
            <FormHelperText sx={{ mt: 2 }}>
              如忘记登录信息或手机号/邮箱地址发生变更，请联系工作人员重置登录信息。
            </FormHelperText>
          }
          <Button fullWidth variant="contained" size="large" sx={{ mt: 4 }}
            onClick={onSubmit} disabled={submitting}>
            登录
          </Button>
        </Paper>
        <Stack direction='row' spacing={2} sx={{ mt: 4 }}>
        <Typography variant='caption'>
          <Link component='a' href='/privacy' target='_blank' underline='hover'>
            隐私政策
          </Link>
        </Typography>
        <Typography variant='caption'>
          <Link component='a' href='/terms' target='_blank' underline='hover'>
            服务条款
          </Link>
        </Typography>
        </Stack>
        <FormHelperText sx={{ mt: 1 }}>
          版权所有 &copy; {new Date().getFullYear()}
          {process.env.REACT_APP_COMPANY_NAME}，保留所有权利。
        </FormHelperText>
        {process.env.REACT_APP_ICP &&
          <FormHelperText sx={{ mt: 1 }}>
            <Link component='a' href={process.env.REACT_APP_ICP_LINK}
              target='_blank' underline='hover'>
              {process.env.REACT_APP_ICP}
            </Link>
          </FormHelperText>
        }
      </Container>
    </Stack>
  )
}
