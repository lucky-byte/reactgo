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
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useSnackbar } from 'notistack';
import uuid from "uuid";
import Cookies from 'universal-cookie';
import userState from "~/state/user";
import { getLastAccess } from '~/lib/last-access';
import useTitle from "~/hook/title";
import Banner from '~/comp/banner';
import Beian from '~/img/beian.png';
import { put, get } from "~/login/fetch";
// import ForgetUserid from './userid';
// import GitHub from "./github";
// import Google from "./google";

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

  useTitle('??????');

  // ??????????????????
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

  // ???????????????ID
  useEffect(() => {
    const cookies = new Cookies();

    const id = cookies.get('reactgo-clientid');
    if (id) {
      setClientId(id);
    } else {
      const newid = uuid.v4();

      cookies.set('reactgo-clientid', newid, {
        path: '/',
        maxAge: 3600 * 24 * 3650,
        httpOnly: false,
        sameSite: 'strict',
      });
      setClientId(newid);
    }
  }, []);

  // ???????????????
  const onUsernameChange = e => {
    setUsername(e.target.value);
  }

  // ??????????????????
  const onUsernameKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  // ????????????
  const onPasswordChange = e => {
    setPassword(e.target.value);
  }

  // ???????????????
  const onPasswordKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  // ????????????
  const onSubmit = async () => {
    if (!username || !password) {
      return enqueueSnackbar('?????????????????????', {
        variant: 'warning', preventDuplicate: true,
      });
    }
    try {
      setSubmitting(true);

      const resp = await put('/signin/', new URLSearchParams({
        username, password, clientid: clientId
      }));
      setSubmitting(false);

      // ?????????????????????????????????
      login(resp);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
      setSubmitting(false);
    }
  }

  // ????????????
  const login = resp => {
    try {
      if (!resp || !resp.token) {
        throw new Error('??????????????????');
      }
      localStorage.setItem('token', resp.token);

      // ????????????????????????
      setUser({
        activate: resp.activate,
      });

      // ????????????????????????
      if (!resp.trust) {
        // ??????????????? TOTP???????????? TOTP ??????
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
        // ???????????????????????????????????????????????????
        if (resp.tfa) {
          if (!resp.smsid) {
            return enqueueSnackbar('?????????????????????', { variant: 'error' });
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
      // ???????????????????????????
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
              LinkComponent={RouteLink} to='/signin' disabled={submitting}>
              ???????????????????????????
            </Button>
          }
          <Tooltip title='??????' arrow>
            <IconButton LinkComponent={RouteLink} to='/bulletin'>
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
          <Typography as='h1' variant='h6' sx={{ mt: 1 }}>???????????????</Typography>
          <TextField required label='?????????' placeholder="????????????????????????"
            fullWidth autoComplete="off" autoFocus
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
                  {/* <ForgetUserid /> */}
                </InputAdornment>
              ),
            }}
            sx={{ mt: 3 }}
          />
          <TextField required label='??????' placeholder="?????????????????????"
            fullWidth autoComplete="new-password"
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
                  <IconButton aria-label="????????????" size='small' onClick={() => {
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
          <Button fullWidth color='info' variant="contained" size="large" sx={{ mt: 4 }}
            onClick={onSubmit} disabled={submitting}>
            ??????
          </Button>
          {providers.length > 0 &&
            <Stack mt={3}>
              <Divider>
                <FormHelperText>???????????????????????????</FormHelperText>
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
      <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
        <Typography variant='caption'>
          &copy; {new Date().getFullYear()} {process.env.REACT_APP_COMPANY_NAME}
        </Typography>
        {process.env.REACT_APP_ICP &&
          <Stack direction='row' alignItems='center'>
            <img src={Beian} alt='??????' height={14} width={14} />
            <Typography variant='caption'>
              <Link href={process.env.REACT_APP_ICP_LINK} target='_blank'
                underline='hover' sx={{ ml: '2px' }}>
                {process.env.REACT_APP_ICP}
              </Link>
            </Typography>
          </Stack>
        }
        <Typography variant='caption'>
          <Link href='/privacy' target='_blank' underline='hover'>????????????</Link>
        </Typography>
        <Typography variant='caption'>
          <Link href='/terms' target='_blank' underline='hover'>????????????</Link>
        </Typography>
      </Stack>
    </Stack>
  )
}

// ??????????????????????????????????????????????????????
function Forget(props) {
  const { loading, resetpass } = props;

  if (loading) {
    return <Box sx={{ height: 26 }} />
  }
  if (resetpass) {
    return (
      <Stack direction='row' justifyContent='flex-end'>
        <Button size='small' LinkComponent={RouteLink} to='/resetpass'>
          ??????????????????
        </Button>
      </Stack>
    )
  }
  return (
    <FormHelperText sx={{ mt: 2, textAlign: 'justify' }}>
      ?????????????????????????????????????????????????????????????????????????????????????????????
    </FormHelperText>
  )
}

// ??????????????????
function Authorize(props) {
  const { provider, ...others } = props;

  // if (provider === 'github') {
  //   return <GitHub {...others} />
  // }
  // if (provider === 'google') {
  //   return <Google {...others} />
  // }
  return null;
}
