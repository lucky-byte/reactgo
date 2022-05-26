import { useEffect, useState } from 'react';
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
import Tooltip from '@mui/material/Tooltip';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import OutlinedPaper from '~/comp/outlined-paper';
import OAuthIcon from '~/comp/oauth-icon';
import TimeAgo from '~/comp/timeago';
import useTitle from "~/hook/title";
import { get } from "~/lib/rest";
import { location } from '~/lib/geo';

export default function SignInList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [list, setList] = useState([]);

  useHotkeys('esc', () => { navigate('..'); });
  useTitle('登录历史');

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
            <Typography variant='h5'>登录历史</Typography>
            <Typography variant='body2'>
              下面是您的账号近半年的登录记录，如存在可疑登录，请联系管理员排查
            </Typography>
          </Stack>
          <Typography variant='caption'>共 {list.length} 条记录</Typography>
        </Stack>
        <TableContainer component={OutlinedPaper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">登录时间</TableCell>
                <TableCell align="center">账号</TableCell>
                <TableCell align="center">系统</TableCell>
                <TableCell align="center">浏览器</TableCell>
                <TableCell align="center">位置</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell align="center">
                    <TimeAgo time={row.create_at} variant='body2' />
                  </TableCell>
                  <TableCell align="center">
                    <OAuthIcon type={row.acttype} provider={row.oauthp} />
                  </TableCell>
                  <TableCell align="center">{row.os}</TableCell>
                  <TableCell align="center">{row.browser}</TableCell>
                  <TableCell align="center">
                    <Tooltip title={row.ip} arrow placement='right'>
                      <Typography variant='body2' sx={{ cursor: 'default' }}>
                        {location(row) || row.ip}
                      </Typography>
                    </Tooltip>
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
