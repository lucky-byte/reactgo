import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import { useNavigate, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import OutlinedPaper from '~/comp/outlined-paper';
import titleState from "~/state/title";
import { get } from "~/rest";

export default function UserSignInList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [list, setList] = useState([]);

  useHotkeys('esc', () => { navigate('..'); });
  useEffect(() => { setTitle('登录历史'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/user/signinlist');
        setList(resp.list || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 2 }}>
          <IconButton aria-label='返回' component={Link} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack sx={{ flex: 1 }}>
            <Typography variant='h6'>登录历史</Typography>
            <Typography variant='caption'>
              系统仅显示近半年的登录历史记录，如存在可疑登录记录，请联系管理员排查
            </Typography>
          </Stack>
          <Typography variant='body2'>共 {list.length} 条记录</Typography>
        </Stack>
        <TableContainer component={OutlinedPaper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">登录时间</TableCell>
                <TableCell align="center">系统</TableCell>
                <TableCell align="center">浏览器</TableCell>
                <TableCell align="center">IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell align="center">
                    {dayjs(row.create_at).format('YY/MM/DD HH:mm:ss')}
                  </TableCell>
                  <TableCell align="center">{row.os}</TableCell>
                  <TableCell align="center">{row.browser}</TableCell>
                  <TableCell align="center">{row.ip} {row.city}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}
