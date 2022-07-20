import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import OutlinedPaper from '~/comp/outlined-paper';
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import { get } from '~/lib/rest';

export default function Info() {
  const location = useLocation();
  const navigate = useNavigate();
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [info, setInfo] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('定时任务信息');

  useEffect(() => {
    (async () => {
      try {
        if (location.state) {
          setProgress(true);

          const params = new URLSearchParams({ uuid: location.state.uuid });
          const resp = await get('/system/task/info?' + params.toString());
          setInfo(resp);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [location.state, enqueueSnackbar, setProgress]);

  if (!location.state?.uuid) {
    return <Navigate to='..' />
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 2 }}>
      <Paper elevation={3} sx={{ px: 5, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' sx={{ mb: 3 }}>
          <IconButton aria-label='返回' onClick={() => { navigate('..') }}
            sx={{ mr: 1 }}>
            <Tooltip arrow title='ESC' placement='top'>
              <ArrowBackIcon color='primary' />
            </Tooltip>
          </IconButton>
          <Typography variant='h6' gutterBottom={false}>
            定时任务详细信息
          </Typography>
        </Stack>
        <BaseInfoTable info={info} />
      </Paper>
    </Container>
  )
}

function BaseInfoTable(props) {
  const { info } = props;

  return (
    <TableContainer component={OutlinedPaper}>
      <Table>
        <TableBody sx={{ 'td': { borderColor: '#8884' } }}>
          <TableRow>
            <TableCell>名称</TableCell>
            <TableCell sx={{ borderLeft: '1px solid', borderRight: '1px solid' }}>
              {info.name}
            </TableCell>
            <TableCell>CRON 表达式</TableCell>
            <TableCell sx={{ borderLeft: '1px solid' }}>
              <code>{info.cron}</code>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>描述</TableCell>
            <TableCell colSpan={3} sx={{ borderLeft: '1px solid' }}>
              {info.summary}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>命令</TableCell>
            <TableCell colSpan={3} sx={{ borderLeft: '1px solid' }}>
              {info.type === 1 ? '函数' : '命令'} {info.path}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>创建时间</TableCell>
            <TableCell sx={{ borderLeft: '1px solid', borderRight: '1px solid' }}>
              {dayjs(info.create_at).format('YYYY/MM/DD HH:mm:ss')}
            </TableCell>
            <TableCell>更新时间</TableCell>
            <TableCell sx={{ borderLeft: '1px solid' }}>
              {dayjs(info.update_at).format('YYYY/MM/DD HH:mm:ss')}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>最后执行时间</TableCell>
            <TableCell sx={{ borderLeft: '1px solid', borderRight: '1px solid' }}>
              {dayjs(info.last_fire).format('YYYY/MM/DD HH:mm:ss')}
            </TableCell>
            <TableCell>执行次数</TableCell>
            <TableCell sx={{ borderLeft: '1px solid' }}>
              {info.nfire}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>状态</TableCell>
            <TableCell colSpan={3} sx={{ borderLeft: '1px solid' }}>
              {info.disabled ? '已禁用' : '正常'}
            </TableCell>
          </TableRow>
          <TableRow sx={{ td: { borderBottom: 0 } }}>
            <TableCell>备注</TableCell>
            <TableCell colSpan={3} sx={{ borderLeft: '1px solid' }}>
              {info.note}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
