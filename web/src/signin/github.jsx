import { useEffect, useState, useRef, useCallback } from 'react';
import { useSetRecoilState } from "recoil"
import { useNavigate } from "react-router-dom";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useSnackbar } from 'notistack';
import userState from "~/state/user";
import { put } from "~/rest";
import popupWindow from '~/lib/popup';

export default function GitHub(props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setUser = useSetRecoilState(userState);
  const [state, setState] = useState('');

  const { clientId, submitting, setSubmitting } = props;

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

          if (!resp || !resp.token) {
            throw new Error('响应数据无效');
          }
          localStorage.setItem('token', resp.token);

          // 保存用户信息到全局状态
          setUser({
            uuid: resp.uuid,
            userid: resp.userid,
            avatar: resp.avatar ? `/image/?u=${resp.avatar}` : '',
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
          enqueueSnackbar(err.message);
        } finally {
          setSubmitting(false);
        }
      }
    }
  }, [state, enqueueSnackbar, setSubmitting, clientId, navigate, setUser]);

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
