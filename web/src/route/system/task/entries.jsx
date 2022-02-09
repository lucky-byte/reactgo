import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import titleState from "~/state/title";
import progressState from '~/state/progress';
import { get } from "~/rest";

export default function Entries() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const [refresh, setRefresh] = useState(true);
  const [entries, setEntries] = useState([]);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useEffect(() => { setTitle('任务诊断'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
          setProgress(true);
          const resp = await get('/system/task/entries');
          setEntries(resp.entries || []);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, setProgress, refresh]);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Stack direction='row' alignItems='center' spacing={1} sx={{ my: 3 }}>
        <IconButton aria-label='返回' component={RouteLink} to='..'>
          <ArrowBackIcon color='primary' />
        </IconButton>
        <Stack sx={{ flex: 1 }}>
          <Typography variant='h6'>任务诊断</Typography>
          <Typography variant='caption'>
            查看系统任务调度器内部运行状态
          </Typography>
        </Stack>
        <Stack direction='row' alignItems='center' spacing={4}>
          <Typography variant='body2'>共 {entries.length} 项</Typography>
          <Button variant='text' startIcon={<RefreshIcon />}
            onClick={() => setRefresh(true)}>
            刷新
          </Button>
        </Stack>
      </Stack>
      <Table size='medium'>
        <TableHead>
          <TableRow sx={{ whiteSpace: 'nowrap' }}>
            <TableCell align='center'>ID</TableCell>
            <TableCell align='center'>名称</TableCell>
            <TableCell align='center'>CRON</TableCell>
            <TableCell align='center'>路径</TableCell>
            <TableCell align='center'>状态</TableCell>
            <TableCell align='center'>上次执行时间</TableCell>
            <TableCell align='center'>下次执行时间</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map(entry => (
            <TableRow hover key={entry.uuid}>
              <TableCell align="center">{entry.entry_id}</TableCell>
              <TableCell align="center">{entry.name}</TableCell>
              <TableCell align="center"><code>{entry.cron}</code></TableCell>
              <TableCell align="center">{entry.path}</TableCell>
              <TableCell align="center">
                {entry.running ?
                  <Typography color='secondary' variant='body2'>运行</Typography>
                  :
                  <span>闲置</span>
                }
              </TableCell>
              <TableCell align="center">
                {dayjs(entry.prev).format('YY-MM-DD HH:mm:ss')}
              </TableCell>
              <TableCell align="center">
                {dayjs(entry.next).format('YY-MM-DD HH:mm:ss')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  )
}
