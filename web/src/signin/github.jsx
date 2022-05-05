import { useEffect, useState, useRef, useCallback } from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useSnackbar } from 'notistack';
import { put } from "~/rest";
import popupWindow from '~/lib/popup';

export default function GitHub(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState('');

  const { submitting, setSubmitting } = props;

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

          await put('/signin/oauth/github/signin', new URLSearchParams({
            userid: e.data.profile?.userid, state,
          }));
        } catch (err) {
          enqueueSnackbar(err.message);
        } finally {
          setSubmitting(false);
        }
      }
    }
  }, [state, enqueueSnackbar, setSubmitting]);

  // 重新事件监听
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

  const onClick = async () => {
    try {
      const resp = await put('/signin/oauth/github/authorize');

      setState(resp.state);

      const q = new URLSearchParams({
        client_id: resp.clientid, redirect_uri: resp.url, state: resp.state,
        scope: 'user:email',
      });
      const url = 'https://github.com/login/oauth/authorize?' + q.toString();

      // window.addEventListener('message', onAuthorizedListener);
      popupRef.current = popupWindow(url, 'GithubSignIn', 650, 600);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Tooltip title='GitHub' arrow>
      <IconButton size='large' disabled={submitting} onClick={onClick}>
        <GitHubIcon fontSize='large' />
      </IconButton>
    </Tooltip>
  )
}
