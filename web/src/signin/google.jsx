import { useEffect, useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useSnackbar } from 'notistack';
import { put } from "~/lib/rest";
import popupWindow from '~/lib/popup';
import GoogleIcon from '~/img/google.svg';

export default function Google(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState('');

  const { clientId, submitting, setSubmitting, login } = props;

  const popupRef = useRef();

  // 授权成功后将收到消息
  const onAuthorizedListener = useCallback(async e => {
    console.log('message: ', e.origin)
    if (process.env.NODE_ENV === 'production') {
      if (e.origin !== window.location.origin) {
        return;
      }
    }
    if (e.source !== popupRef.current) {
      return;
    }
    if (e.data.source === 'reactgo-google-authorize') {
      window.removeEventListener('message', onAuthorizedListener);

      if (popupRef.current) {
        popupRef.current.close();
      }
      console.log(state)
      console.log(e.data.state)
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
    console.log('use effect')
    if (state) {
      window.addEventListener('message', onAuthorizedListener);
    }
    return () => {
      console.log('cleanup')
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
        response_type: 'code',
        scope: 'openid email profile',
        redirect_uri: resp.url,
        state: resp.state,
        nonce: Math.random(),
      });
      const url = discovery.authorization_endpoint + '?' + q.toString();

      // 打开新窗口进行授权
      popupRef.current = popupWindow(url, 'GoogleAuthorize', 650, 650);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Tooltip title='Google' arrow>
      <IconButton size='large' disabled={submitting} onClick={onAuthorizeClick}>
        <Box width={35} height={35}
          display='flex' alignItems='flex-end' justifyContent='center'>
          <img src={GoogleIcon} alt='LOGO' style={{ width: 32, height: 32 }} />
        </Box>
      </IconButton>
    </Tooltip>
  )
}
