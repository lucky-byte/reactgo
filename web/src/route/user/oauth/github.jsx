import { useEffect, useState, useRef, useCallback } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import { useSecretCode } from '~/comp/secretcode';
import { get, put } from "~/lib/rest";
import popupWindow from '~/lib/popup';

export default function GitHub() {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const secretCode = useSecretCode();
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(1);
  const [refresh, setRefresh] = useState(true);

  const popupRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
          setLoading(true);

          const resp = await get('/user/oauth/github/setting');

          setClientId(resp.clientid);
          setEnabled(resp.enabled);
          setEmail(resp.email);
          setStatus(resp.status);
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
    // 必须是来自同源的消息
    if (process.env.NODE_ENV === 'production') {
      if (e.origin !== window.location.origin) {
        return;
      }
    }
    if (e.data.source === 'reactgo-github-authorize') {
      if (e.source !== popupRef.current) {
        return enqueueSnackbar('接收到来自非期望的窗口的消息，忽略...');
      }
      window.removeEventListener('message', onAuthorizedListener);

      if (popupRef.current) {
        popupRef.current.close();
      }
      enqueueSnackbar('账号授权成功', { variant: 'success' });
      setRefresh(true);
    }
  }, [enqueueSnackbar]);

  // 卸载时删除事件监听
  useEffect(() => {
    return () => {
      window.removeEventListener('message', onAuthorizedListener);
    }
  }, [onAuthorizedListener]);

  // 授权
  const onAuthorize = async () => {
    if (!enabled) {
      return enqueueSnackbar('系统未启用 GitHub 身份授权')
    }
    if (!clientId) {
      return enqueueSnackbar('系统 GitHub 身份授权配置信息不完整')
    }
    try {
      const token = await secretCode();

      const resp = await put('/user/oauth/github/authorize', new URLSearchParams({
        secretcode_token: token,
      }));

      const q = new URLSearchParams({
        client_id: clientId, redirect_uri: resp.url, state: resp.state,
        scope: 'user:email',
      });
      const url = 'https://github.com/login/oauth/authorize?' + q.toString();

      window.addEventListener('message', onAuthorizedListener);
      popupRef.current = popupWindow(url, 'GithubAuthorize', 650, 600);
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
        description: '确定要撤销 GitHub 账号授权吗？撤销后不能再通过 GitHub 账号登录',
        confirmationText: '确定',
        confirmationButtonProps: { color: 'warning' },
      });
      await put('/user/oauth/github/revoke');
      enqueueSnackbar('成功撤销授权', { variant: 'success' });
      setRefresh(true);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Stack direction='row' justifyContent='space-between' alignItems='center'>
      <Stack direction='row' spacing={2} alignItems='center'>
        <GitHubIcon fontSize='large' />
        <Stack>
          <Typography variant='h6' lineHeight='1.2'>GitHub</Typography>
          {loading ? <Skeleton variant="text" width={300} /> : enabled ?
            <Typography variant='caption'>
              {status === 2 ?
                `已授权 ${email}` : '授权使用您的 GitHub 账号登录本系统'
              }
            </Typography>
            :
            <Typography variant='caption' color='orange'>
              系统尚未启用 GitHub 身份授权，请联系系统管理员
            </Typography>
          }
        </Stack>
      </Stack>
      {status === 2 ?
        <Button variant='contained' color='warning' disabled={!enabled}
          onClick={onRevoke}>
          撤销
        </Button>
        :
        <Button variant='contained' color='success' disabled={!enabled}
          onClick={onAuthorize}>
          授权
        </Button>
      }
    </Stack>
  )
}
