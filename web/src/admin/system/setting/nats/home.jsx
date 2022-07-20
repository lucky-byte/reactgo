import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Switch from '@mui/material/Switch';
import Collapse from "@mui/material/Collapse";
import { useSnackbar } from 'notistack';
import InplaceInput from '~/comp/inplace-input';
import useTitle from "~/hook/title";
import progressState from '~/state/progress';
import { get, post, put } from "~/lib/rest";
import { useNatsTab } from '../tabstate';

export default function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const [enabled, setEnabled] = useState(false);
  const [servers, setServers] = useState('');

  useTitle('消息服务');
  useNatsTab();

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/system/setting/nats/config');
        setEnabled(resp.enabled || false);
        setServers(resp.servers || '');
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  // 启用/停用
  const onEnabledChange = async e => {
    try {
      const enable = e.target.checked;
      const _audit = `${enable ? '启用' : '停用'} 消息服务`;

      await put('/system/setting/nats/enabled', new URLSearchParams({
        enable, _audit,
      }));
      setEnabled(enable);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 修改服务器
  const onServersChange = async servers => {
    try {
      const _audit = '修改 NATS 服务器地址';

      await post('/system/setting/nats/servers', new URLSearchParams({
        servers, _audit,
      }));
      setServers(servers);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <Typography variant='h4'>消息服务</Typography>
      <Typography variant='body2'>
        通过消息服务，WEB端可以实时接收服务器端发送的消息，包括通知，事件等
      </Typography>
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography>启用消息服务</Typography>
          <Switch checked={enabled} onChange={onEnabledChange}
            inputProps={{ 'aria-label': '启用或禁用高德定位服务' }}
          />
        </Stack>
        <Collapse in={!enabled}>
          <Stack direction='row' alignItems='center' mt={2} spacing={1}>
            <Typography variant='subtitle2'>
              NATS 服务器地址:
            </Typography>
            <InplaceInput sx={{ flex: 1 }} text={servers}
              placeholder='请填写' color="primary" onConfirm={onServersChange}
            />
          </Stack>
        </Collapse>
      </Paper>
    </Stack>
  )
}
