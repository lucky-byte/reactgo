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
    if (e.data.source === 'reactgo-github-authorize') {
      window.removeEventListener('message', onAuthorizedListener);

      if (popupRef.current) {
        popupRef.current.close();
      }
      console.log(state)
      console.log(e.data.state)
      if (state === e.data.state) {
        try {
          setSubmitting(true);

          const resp = await put('/signin/oauth/github/signin', new URLSearchParams({
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
      const resp = await put('/signin/oauth/github/authorize');

      setState(resp.state);

      // 打开新窗口进行授权
      const q = new URLSearchParams({
        client_id: resp.clientid, redirect_uri: resp.url, state: resp.state,
        scope: 'user:email',
      });
      const url = 'https://github.com/login/oauth/authorize?' + q.toString();
      popupRef.current = popupWindow(url, 'GithubSignIn', 650, 600);
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
