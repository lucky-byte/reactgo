import { useEffect, useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import { useSecretCode } from '~/comp/secretcode';
import Avatar from '~/comp/avatar';
import { get, put } from "~/lib/rest";
import popupWindow from '~/lib/popup';
import GoogleIcon from '~/img/google.svg';

export default function Google() {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const secretCode = useSecretCode();
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(1);
  const [avatar, setAvatar] = useState('');
  const [state, setState] = useState('');
  const [refresh, setRefresh] = useState(true);

  const popupRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
          setLoading(true);

          const resp = await get('/user/oauth/google/setting');

          setClientId(resp.clientid);
          setEnabled(resp.enabled);
          setEmail(resp.email);
          setStatus(resp.status);
          setAvatar(resp.avatar);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, refresh]);

  // 授权成功后将收到消息
  const onAuthorizedListener = useCallback(e => {
    if (process.env.NODE_ENV === 'development') {
      console.log('google authorized message from ', e.origin);
    }
    if (process.env.NODE_ENV === 'production') {
      // 必须是来自同源的消息
      if (e.origin !== window.location.origin) {
        return enqueueSnackbar('接收到来自非同源消息，忽略...');
      }
    }
    if (e.data.source === 'reactgo-google-authorize') {
      if (e.source !== popupRef.current) {
        return enqueueSnackbar('接收到来自非期望的窗口的消息，忽略...');
      }
      window.removeEventListener('message', onAuthorizedListener);

      if (popupRef.current) {
        popupRef.current.close();
      }
      enqueueSnackbar(`已授权账号 ${e.data.profile?.email}`, { variant: 'success' });
      setRefresh(true);
    }
  }, [enqueueSnackbar]);

  // 卸载时删除事件监听
  useEffect(() => {
    if (state) {
      window.addEventListener('message', onAuthorizedListener);
    }
    return () => {
      window.removeEventListener('message', onAuthorizedListener);
    }
  }, [onAuthorizedListener, state]);

  // 授权
  const onAuthorize = async () => {
    if (!enabled) {
      return enqueueSnackbar('系统未启用 Google 身份授权')
    }
    if (!clientId) {
      return enqueueSnackbar('系统 Google 身份授权配置信息不完整')
    }
    try {
      const token = await secretCode();

      const resp = await put('/user/oauth/google/authorize', new URLSearchParams({
        secretcode_token: token,
      }));
      setState(resp.state);

      // 查询 Google discovery 配置
      const c = await fetch(
        'https://accounts.google.com/.well-known/openid-configuration'
      );
      const discovery = await c.json();

      const q = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        scope: 'openid email profile',
        redirect_uri: resp.url,
        state: resp.state,
        nonce: Math.random(),
      });
      const url = discovery.authorization_endpoint + '?' + q.toString();
      popupRef.current = popupWindow(url, 'GoogleAuthorize', 650, 650);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 撤销
  const onRevoke = async () => {
    try {
      await confirm({
        description: '确定要撤销 Google 账号授权吗？撤销后不能再通过 Google 账号登录',
        confirmationText: '确定',
        confirmationButtonProps: { color: 'warning' },
      });
      await put('/user/oauth/google/revoke');
      enqueueSnackbar('撤销成功', { variant: 'success' });
      setRefresh(true);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Stack direction='row' alignItems='center' spacing={2} p={1}>
      <Stack direction='row' spacing={2} alignItems='center' flex={1}>
        <Box width={35} height={35}
          display='flex' justifyContent='center' alignItems='center'>
          <img src={GoogleIcon} alt='LOGO' style={{ width: 30, height: 30 }} />
        </Box>
        <Stack>
          <Typography variant='h6' lineHeight='1.2'>Google</Typography>
          {loading ? <Skeleton variant="text" width={300} /> : enabled ?
            <Typography variant='caption'>
              {status === 2 ? '已授权' : '授权使用您的 Google 账号登录本系统'}
            </Typography>
            :
            <Typography variant='caption' color='orange'>
              系统尚未配置或启用 Google 身份授权服务，请联系管理员
            </Typography>
          }
        </Stack>
      </Stack>
      {enabled && (status === 2 &&
        <Chip variant='outlined' label={email}
          avatar={avatar ? <Avatar src={avatar} /> : null}
        />
      )}
      {enabled && (status === 2 ?
        <Button variant='contained' color='warning' onClick={onRevoke}>
          撤销
        </Button>
        :
        <Button variant='contained' color='success' onClick={onAuthorize}>
          授权
        </Button>
      )}
    </Stack>
  )
}
