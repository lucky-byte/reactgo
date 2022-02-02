import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil"
import { useTheme } from "@mui/material/styles";
import { useNavigate, Link as RouteLink } from "react-router-dom";
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
  const [resetpass, setResetpass] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHide, setPasswordHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const setUser = useSetRecoilState(userState);

  const Logo = theme.palette.mode === 'dark' ? BannerDark : Banner;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await get('/signin/settings')
        setResetpass(resp.resetpass);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar]);

  const onUsernameChange = e => {
    setUsername(e.target.value);
  }

  const onPasswordChange = e => {
    setPassword(e.target.value);
  }

  const onPasswordKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  const onSubmit = async () => {
    if (!username || !password) {
      return enqueueSnackbar('请输入登录信息', {
        variant: 'warning', preventDuplicate: true,
      });
    }
    try {
      setLoading(true);

      const resp = await put('/signin/', new URLSearchParams({
        username, password
      }));
      setLoading(false);

      if (!resp || !resp.token) {
        throw new Error('服务器响应数据无效');
      }
      setUser({
        userid: resp.userid,
        name: resp.name,
        email: resp.email,
        mobile: resp.mobile,
        address: resp.address,
        secretcode_isset: resp.secretcode_isset,
        allows: resp.allows,
      });
      localStorage.setItem('token', resp.token);

      if (resp.tfa) {
        if (!resp.smsid) {
          return enqueueSnackbar('服务器响应数据不完整', { variant: 'error' });
        }
        return navigate('/signin/sms', { state: { smsid: resp.smsid } });
      }
      // 跳转到最近访问页面
      let last_access = localStorage.getItem('last-access');
      localStorage.removeItem('last-access');
      if (last_access?.startsWith('/signin')) {
        last_access = '/';
      }
      navigate(last_access || '/', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
      setLoading(false);
    }
  }

  return (
    <Container as='main' role='main' maxWidth='xs' sx={{
      display: 'flex', flexDirection: 'column', alignItems:'center',
    }}>
      <Paper elevation={3} sx={{ mt: 10, py: 3, px: 4, width: '100%' }}>
        <Stack sx={{ alignItems: 'center' }}>
          <img src={Logo} alt='Logo' height='36px' />
          <Typography as='h1' variant='subtitle1' sx={{mt:1}}>请登录</Typography>
        </Stack>
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
        {!loading && (resetpass ?
          <FormHelperText sx={{ mt: 1, textAlign: 'right' }}>
            <Link component={RouteLink} to='/resetpass' underline="hover">
              忘记登录密码？
            </Link>
          </FormHelperText>
          :
          <FormHelperText sx={{ mt: 2 }}>
            如忘记登录信息或手机号/邮箱地址发生变更，请联系工作人员重置登录信息。
          </FormHelperText>
        )}
        <Button fullWidth variant="contained" size="large" sx={{ mt: 4 }}
          onClick={onSubmit} disabled={loading}>
          登录
        </Button>
      </Paper>
      <Typography variant='body2' sx={{ mt: 2 }}>
        <Link component='a' href='/privacy' target='_blank' underline='hover'>
          隐私政策
        </Link>
      </Typography>
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
  )
}
