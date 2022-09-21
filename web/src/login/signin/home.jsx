import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil"
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import LinearProgress from '@mui/material/LinearProgress';
import FormHelperText from "@mui/material/FormHelperText";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from "uuid";
import Cookies from 'universal-cookie';
import userState from "~/state/user";
import { put, get } from "~/login/fetch";
import { getLastAccess } from '~/lib/last-access';
import useTitle from "~/hook/title";
import Banner from '~/comp/banner';
import Footer from '~/comp/footer';
import ForgetUserid from './userid';
import GitHub from "./github";
import Google from "./google";

export default function Home() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setUser = useSetRecoilState(userState);
  const [signupable, setSignupable] = useState(false);
  const [lookUserid, setLookUserid] = useState(false);
  const [resetPass, setResetPass] = useState(false);
  const [providers, setProviders] = useState([]);
  const [clientId, setClientId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHide, setPasswordHide] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useTitle('请登录');

  // 查询系统设置
  useEffect(() => {
    (async () => {
      try {
        if (loading) {
          const resp = await get('/signin/settings')

          setSignupable(resp.signupable);
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
    const cookies = new Cookies();

    const id = cookies.get('reactgo-clientid');
    if (id) {
      setClientId(id);
    } else {
      const newid = uuidv4();

      cookies.set('reactgo-clientid', newid, {
        path: '/',
        maxAge: 3600 * 24 * 3650,
        httpOnly: false,
        sameSite: 'strict',
      });
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

      // 保存用户活动状态
      setUser({
        activate: resp.activate,
      });

      // 当前设备不可信任
      if (!resp.trust) {
        // 如果设置了 TOTP，则进入 TOTP 认证
        if (resp.totp_isset) {
          return navigate('otp', {
            state: {
              tfa: resp.tfa,
              smsid: resp.smsid,
              mobile: resp.mobile,
              historyid: resp.historyid,
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
              totp: resp.totp_isset,
              smsid: resp.smsid,
              mobile: resp.mobile,
              historyid: resp.historyid,
            }
          });
        }
      }
      // 跳转到最近访问页面
      navigate(getLastAccess());
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  }

  return (
    <Stack as='main' role='main' sx={{ mb: 5 }}>
      <Toolbar>
        <Box sx={{ flex: 1 }}>
          <Banner height={28} />
        </Box>
        <Stack direction='row' alignItems='center' spacing={1}>
          {signupable &&
            <Button color='info' size='small' variant='outlined'
              LinkComponent={RouteLink} to='/signup' disabled={submitting}>
              注册新账号
            </Button>
          }
          <Tooltip title='公告' arrow>
            <IconButton LinkComponent={RouteLink} to='/public/bulletin'>
              <CampaignIcon color='primary' />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
      <Container maxWidth='xs'>
        <Paper elevation={3} sx={{ my: 6, pt: 2, pb: 4, px: 4, position: 'relative' }}>
          {(loading || submitting) &&
            <Box position='absolute' left={0} top={0} right={0}>
              <LinearProgress />
            </Box>
          }
          <Typography as='h1' variant='h6' sx={{ mt: 1 }}>欢迎，请登录</Typography>
          <TextField required label='登录名' placeholder="请输入登录名"
            fullWidth autoComplete="username" autoFocus
            variant='standard' value={username} onChange={onUsernameChange}
            onKeyDown={onUsernameKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" />
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
                  <KeyIcon fontSize="small" />
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
          <Button fullWidth color='success' variant="contained" size="large" sx={{ mt: 4 }}
            onClick={onSubmit} disabled={submitting}>
            登录
          </Button>
          {providers.length > 0 &&
            <Stack mt={3}>
              <Divider>
                <FormHelperText>或使用下列账号登录</FormHelperText>
              </Divider>
              <Stack direction='row' justifyContent='center' alignItems='center'
                spacing={1} mt={1}>
                {providers.map(p => (
                  <Authorize key={p} provider={p} clientId={clientId} login={login}
                    submitting={submitting} setSubmitting={setSubmitting}
                  />
                ))}
              </Stack>
            </Stack>
          }
        </Paper>
      </Container>
      <Footer nobanner />
    </Stack>
  )
}

// 根据系统设置确定是否显示忘记登录密码
function Forget(props) {
  const { loading, resetpass } = props;

  if (loading) {
    return <Box sx={{ height: 26 }} />
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
    <FormHelperText sx={{ mt: 2, textAlign: 'justify' }}>
      当前系统设置不允许找回登录密码，如忘记登录信息，请联系技术支持
    </FormHelperText>
  )
}

// 授权账号登录
function Authorize(props) {
  const { provider, ...others } = props;

  if (provider === 'github') {
    return <GitHub {...others} />
  }
  if (provider === 'google') {
    return <Google {...others} />
  }
  return null;
}
