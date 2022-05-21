import { useEffect, useState, useRef, useCallback } from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useSnackbar } from 'notistack';
import popupWindow from '~/lib/popup';
import { put } from "~/login/fetch";

export default function GitHub(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState('');

  const { clientId, submitting, setSubmitting, login } = props;

  const popupRef = useRef();

  // 授权成功后将收到消息
  const onAuthorizedListener = useCallback(async e => {
    if (process.env.NODE_ENV === 'development') {
      console.log('github authorized message from ', e.origin);
    }
    if (process.env.NODE_ENV === 'production') {
      if (e.origin !== window.location.origin) {
        return enqueueSnackbar('来自不同源的消息，忽略...');
      }
    }
    if (e.data.source === 'reactgo-github-authorize') {
      if (e.source !== popupRef.current) {
        return enqueueSnackbar('来自不明窗口的消息，忽略...');
      }
      popupRef.current?.close();

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
      const resp = await put('/signin/oauth/github/authorize');
      setState(resp.state);

      const q = new URLSearchParams({
        client_id: resp.clientid,
        redirect_uri: resp.url,
        state: resp.state,
        scope: 'user:email',
      });
      const url = 'https://github.com/login/oauth/authorize?' + q.toString();

      // 打开新窗口进行授权
      popupRef.current = popupWindow(url, 'GithubSignIn', 650, 600);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Tooltip title='GitHub' arrow>
      <IconButton size='large' disabled={submitting} onClick={onAuthorizeClick}>
        <GitHubIcon sx={{ height: 36, width: 36 }} />
      </IconButton>
    </Tooltip>
  )
}
