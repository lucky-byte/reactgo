import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import OutlinedPaper from '~/comp/outlined-paper';
import titleState from "~/state/title";
import progressState from '~/state/progress';
import { get } from "~/rest";

export default function TaskEntries() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const [entries, setEntries] = useState([]);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useEffect(() => { setTitle('任务诊断'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);
        const resp = await get('/system/task/entries');
        setEntries(resp.entries || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton component={RouteLink} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack>
            <Typography variant='h6'>任务诊断</Typography>
            <Typography variant='caption'>
              配置定时任务需要对系统内部有比较深入的了解，请在开发人员的指导下进行配置
            </Typography>
          </Stack>
        </Stack>
      <TableContainer component={OutlinedPaper}>
        <Table size='medium'>
          <TableHead>
            <TableRow sx={{ whiteSpace:'nowrap' }}>
              <TableCell align='center'>ID</TableCell>
              <TableCell align='center'>名称</TableCell>
              <TableCell align='center'>CRON</TableCell>
              <TableCell align='center'>函数/命令</TableCell>
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
                  {dayjs(entry.prev).format('YY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell align="center">
                  {dayjs(entry.next).format('YY-MM-DD HH:mm:ss')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>
    </Container>
  )
}
