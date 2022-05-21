import { useEffect, useState, useRef, useCallback } from 'react';
import { useTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useSnackbar } from 'notistack';
import popupWindow from '~/lib/popup';
import GoogleIcon1 from '~/img/google.png';
import GoogleIcon2 from '~/img/google-alt.png';
import { put } from "~/login/fetch";

export default function Google(props) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState('');

  const { clientId, submitting, setSubmitting, login } = props;

  const GoogleIcon = theme.palette.mode === 'dark' ? GoogleIcon1 : GoogleIcon2;

  const popupRef = useRef();

  // 授权成功后将收到消息
  const onAuthorizedListener = useCallback(async e => {
    if (process.env.NODE_ENV === 'development') {
      console.log('google authorized message from ', e.origin);
    }
    if (process.env.NODE_ENV === 'production') {
      if (e.origin !== window.location.origin) {
        return enqueueSnackbar('来自不同源的消息，忽略...');
      }
    }
    if (e.data.source === 'reactgo-google-authorize') {
      if (e.source !== popupRef.current) {
        return enqueueSnackbar('来自不明窗口的消息，忽略...');
      }
      popupRef.current?.close();

      if (state === e.data.state) {
        try {
          setSubmitting(true);

          const resp = await put('/signin/oauth/google/signin', new URLSearchParams({
            clientid: clientId, userid: e.data.profile?.userid, state,
          }));
          setSubmitting(false);

          // 登录成功，更新前端信息
          login(resp);
        } catch (err) {
          enqueueSnackbar(err.message);
        } finally {
          setSubmitting(false);
        }
      }
    }
  }, [state, enqueueSnackbar, setSubmitting, clientId, login]);

  // 监听窗口消息，授权成功后将通过窗口间 PostMessage 进行通信
  useEffect(() => {
    if (state) {
      window.addEventListener('message', onAuthorizedListener);
    }
    return () => {
      window.removeEventListener('message', onAuthorizedListener);
    }
  }, [onAuthorizedListener, state]);

  // 开始授权
  const onAuthorizeClick = async () => {
    try {
      const resp = await put('/signin/oauth/google/authorize');
      setState(resp.state);

      // 查询 Google discovery 配置
      const c = await fetch(
        'https://accounts.google.com/.well-known/openid-configuration'
      );
      const discovery = await c.json();

      const q = new URLSearchParams({
        client_id: resp.clientid,
        redirect_uri: resp.url,
        state: resp.state,
        response_type: 'code',
        scope: 'openid email profile',
        nonce: Math.random(),
      });
      const url = discovery.authorization_endpoint + '?' + q.toString();

      // 打开新窗口进行授权
      popupRef.current = popupWindow(url, 'GoogleAuthorize', 650, 650);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Tooltip title='Google' arrow>
      <IconButton size='large' disabled={submitting} onClick={onAuthorizeClick}>
        <Box width={36} height={36}
          display='flex' alignItems='flex-end' justifyContent='center'>
          <img src={GoogleIcon} alt='LOGO' style={{
            width: 34, height: 34, opacity: submitting ? 0.3 : 1,
          }} />
        </Box>
      </IconButton>
    </Tooltip>
  )
}
