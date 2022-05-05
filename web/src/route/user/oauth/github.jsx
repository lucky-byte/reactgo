import { useEffect, useState, useRef, useCallback } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import { useSecretCode } from '~/comp/secretcode';
import { get, put } from "~/rest";
import openWindow from './open';

export default function GitHub() {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const secretCode = useSecretCode();
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(1);
  const [state, setState] = useState('');
  const [refresh, setRefresh] = useState(true);

  const popupWin = useRef();

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
          setLoading(true);

          const resp = await get('/user/oauth/github/setting');

          setClientId(resp.clientid);
          setEnabled(resp.enabled);
          setStatus(resp.status);
          setEmail(resp.email);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, refresh]);

  const onAuthorizedListener = useCallback(e => {
    console.log(e)
    window.removeEventListener('message', onAuthorizedListener);
  }, []);

  useEffect(() => {
    return () => {
      console.log('remove listener')
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
      setState(resp.id);

      const q = new URLSearchParams({
        client_id: clientId, redirect_uri: resp.url, state: resp.id,
        scope: 'user:email',
      });
      const url = 'https://github.com/login/oauth/authorize?' + q.toString();
      const win = openWindow(url, 'GithubAuthorize', 650, 600);
      popupWin.current = win;

      window.removeEventListener('message', onAuthorizedListener);
      window.addEventListener('message', onAuthorizedListener, { once: false });
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
      enqueueSnackbar('撤销成功', { variant: 'success' });
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
                `已授权帐号 ${email} 登录本系统` : '授权使用您的 GitHub 账号登录本系统'
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
