import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil"
import { useTheme } from "@mui/material/styles";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import { useSnackbar } from 'notistack';
import uuid from "uuid";
import Banner from '~/img/banner.png';
import BannerDark from '~/img/banner-dark.png';
import userState from "~/state/user";
import { put, get } from "~/rest";
import Beian from '~/img/beian.png';
import ForgetUserid from './userid';
import GitHub from "./github";

export default function SignIn() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setUser = useSetRecoilState(userState);
  const [lookUserid, setLookUserid] = useState(false);
  const [resetPass, setResetPass] = useState(false);
  const [providers, setProviders] = useState([]);
  const [clientId, setClientId] = useState('');
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
        if (loading) {
          const resp = await get('/signin/settings')
          setLookUserid(resp.lookuserid);
          setResetPass(resp.resetpass);
          setProviders(resp.providers || []);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, loading]);

  // 查询客户端ID
  useEffect(() => {
    const id = localStorage.getItem('client-id');
    if (id) {
      setClientId(id);
    } else {
      const newid = uuid.v4();
      localStorage.setItem('client-id', newid);
      setClientId(newid);
    }
  }, []);

  // 登录名改变
  const onUsernameChange = e => {
    setUsername(e.target.value);
  }

  // 登录名框回车
  const onUsernameKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
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

      const resp = await put('/signin/', new URLSearchParams({
        username, password, clientid: clientId
      }));
      setSubmitting(false);

      // 登录成功，更新前端信息
      login(resp);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
      setSubmitting(false);
    }
  }

  // 登录系统
  const login = resp => {
    try {
      if (!resp || !resp.token) {
        throw new Error('响应数据无效');
      }
      localStorage.setItem('token', resp.token);

      // 保存用户信息到全局状态
      setUser({
        uuid: resp.uuid,
        userid: resp.userid,
        avatar: resp.avatar,
        name: resp.name,
        email: resp.email,
        mobile: resp.mobile,
        address: resp.address,
        secretcode_isset: resp.secretcode_isset,
        totp_isset: resp.totp_isset,
        allows: resp.allows,
        activate: resp.activate,
      });

      // 当前设备不可信任，如果设置了 TOTP，则进入 TOTP 认证
      if (!resp.trust) {
        if (resp.totp_isset) {
          return navigate('otp', {
            state: {
              tfa: resp.tfa, historyid: resp.historyid,
            }
          });
        }
        // 如果设置了短信认证，则进入短信认证
        if (resp.tfa) {
          if (!resp.smsid) {
            return enqueueSnackbar('响应数据不完整', { variant: 'error' });
          }
          return navigate('sms', {
            state: {
              smsid: resp.smsid, historyid: resp.historyid,
            }
          });
        }
      }
      // 跳转到最近访问页面
      let last = localStorage.getItem('last-access');
      if (last?.startsWith('/signin') || last?.startsWith('/resetpass')) {
        last = '/';
      }
      localStorage.removeItem('last-access');
      navigate(last || '/', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  }

  return (
    <Stack as='main' role='main'>
      <Toolbar>
        <img src={Logo} alt='Logo' height='28px' />
      </Toolbar>
      <Container maxWidth='xs'>
        <Paper elevation={3} sx={{ my: 7, py: 3, px: 4, width: '100%' }}>
          <Typography as='h1' variant='h6' sx={{ mt: 1 }}>欢迎，请登录</Typography>
          <TextField required label='登录名' placeholder="请输入登录名"
            fullWidth autoComplete="username" autoFocus
            variant='standard' value={username} onChange={onUsernameChange}
            onKeyDown={onUsernameKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
              endAdornment: lookUserid && (
                <InputAdornment position="end">
                  <ForgetUserid />
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
                  <IconButton aria-label="显示密码" size='small' onClick={() => {
                    setPasswordHide(!passwordHide);
                  }}>
                    {passwordHide ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mt: 4 }}
          />
          <Forget loading={loading} resetpass={resetPass} />
          <Button fullWidth variant="contained" size="large" sx={{ mt: 4 }}
            onClick={onSubmit} disabled={submitting}>
            登录
          </Button>
          {providers.length > 0 &&
            <Stack mt={3}>
              <Divider>
                <FormHelperText>或使用下列账号登录</FormHelperText>
              </Divider>
              <Stack direction='row' justifyContent='center' alignItems='center'
                spacing={2} mt={1}>
                {providers.map(p => (
                  <Authorize key={p} provider={p} clientId={clientId}
                    submitting={submitting} setSubmitting={setSubmitting}
                    login={login}
                  />
                ))}
              </Stack>
            </Stack>
          }
        </Paper>
      </Container>
      <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}
        sx={{ p: 2, position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <Typography variant='caption'>
          版权所有 &copy; {new Date().getFullYear()}&nbsp;
          {process.env.REACT_APP_COMPANY_NAME}，保留所有权利
        </Typography>
        {process.env.REACT_APP_ICP &&
          <Typography variant='caption'>
            <img src={Beian} alt='备案' height={12} width={12} />
            <Link href={process.env.REACT_APP_ICP_LINK} target='_blank'
              underline='hover' sx={{ ml: '3px' }}>
              {process.env.REACT_APP_ICP}
            </Link>
          </Typography>
        }
        <Typography variant='caption'>
          <Link href='/privacy' target='_blank' underline='hover'>隐私政策</Link>
        </Typography>
        <Typography variant='caption'>
          <Link href='/terms' target='_blank' underline='hover'>服务条款</Link>
        </Typography>
      </Stack>
    </Stack>
  )
}

function Forget(props) {
  const { loading, resetpass } = props;

  if (loading) {
    return <Box sx={{height: 26}} />
  }
  if (resetpass) {
    return (
      <Stack direction='row' justifyContent='flex-end'>
        <Button size='small' LinkComponent={RouteLink} to='/resetpass'>
          忘记登录密码
        </Button>
      </Stack>
    )
  }
  return (
    <FormHelperText sx={{ mt: 2 }}>
      当前系统安全设置不允许用户找回登录密码，如忘记登录信息，请联系管理员重置
    </FormHelperText>
  )
}

// 三方账号登录
function Authorize(props) {
  const { provider, ...others } = props;

  if (provider === 'github') {
    return <GitHub {...others} />
  }

  return null;
}
