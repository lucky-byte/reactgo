import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import Switch from '@mui/material/Switch';
import { useSnackbar } from 'notistack';
import useTitle from "~/hook/title";
import progressState from '~/state/progress';
import { get, put } from "~/lib/rest";
import { useDebugTab } from './tabstate';

export default function Debug() {
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const [debug, setDebug] = useState(false);

  useTitle('诊断模式');
  useDebugTab();

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/system/setting/debug/');
        setDebug(resp.debug || false);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  // 启用/停用高德定位
  const onAMapEnableChange = async e => {
    try {
      const enable = e.target.checked;
      const _audit = `${enable ? '启用' : '停用'} 诊断模式`;

      await put('/system/setting/debug/', new URLSearchParams({
        enable, _audit,
      }));
      setDebug(enable);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <Typography variant='h4'>诊断模式</Typography>
      <Typography variant='body2'>
        开启诊断模式将在日志中输出更多的信息，在服务器运行阶段开启或关闭诊断模式将会重启服务
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography>启用诊断模式</Typography>
          <Switch checked={debug} onChange={onAMapEnableChange}
            inputProps={{ 'aria-label': '启用或禁用高德定位服务' }}
          />
        </Stack>
          <FormHelperText sx={{ mt: 1 }}>
            开启诊断模式会降低服务器的性能，建议在排查问题时开启，正常情况下关闭
          </FormHelperText>
      </Paper>
    </Stack>
  )
}
