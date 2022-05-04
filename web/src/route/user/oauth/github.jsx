import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useSnackbar } from 'notistack';
import { get } from "~/rest";
import openWindow from './open';

export default function GitHub() {
  const { enqueueSnackbar } = useSnackbar();
  const [clientId, setClientId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(1);
  const [state, setState] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/user/oauth/github/setting');
        setClientId(resp.clientid);
        setEnabled(resp.enabled);
        setEmail(resp.email);
        setStatus(resp.status);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  const onAuthorize = async () => {
    if (!enabled) {
      return enqueueSnackbar('系统未启用 GitHub 身份授权')
    }
    if (!clientId) {
      return enqueueSnackbar('系统 GitHub 身份授权配置信息不完整')
    }
    try {
      const resp = await get('/user/oauth/github/open');

      setState(resp.id);

      const q = new URLSearchParams({
        client_id: clientId, redirect_uri: resp.url, state: resp.id,
        scope: 'user:email',
      });
      const url = 'https://github.com/login/oauth/authorize?' + q.toString();
      const win = openWindow(url, 'GithubAuthorize', 650, 600);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack direction='row' spacing={2} alignItems='center'>
          <GitHubIcon fontSize='large' />
          <Stack>
            <Typography variant='h6'>GitHub</Typography>
            {enabled ?
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
          <Button variant='contained' disableElevation color='warning'
            disabled={!enabled} onClick={onAuthorize}>
            撤销
          </Button>
          :
          <Button variant='contained' disableElevation color='success'
            disabled={!enabled} onClick={onAuthorize}>
            授权
          </Button>
        }
      </Stack>
    </>
  )
}
