import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import OutlinedPaper from '~/comp/outlined-paper';
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import usePrint from '~/hook/print';
import { get } from '~/rest';
import { geo } from '~/lib/geo';

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [profile, setProfile] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('用户详细资料');

  const contentRef = useRef();
  const print = usePrint(contentRef.current);

  useEffect(() => {
    (async () => {
      try {
        if (location.state) {
          setProgress(true);

          const params = new URLSearchParams({ uuid: location.state.uuid });
          const resp = await get('/system/user/profile?' + params.toString());
          setProfile(resp);
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
    <Container as='main' maxWidth='md'>
      <Paper ref={contentRef} sx={{
        px: 4, py: 3, my: 5, '@media print': {
          boxShadow: 0, borderWidth: 0,
        }
      }}>
        <Stack direction='row' alignItems='center' sx={{ mb: 3 }}>
          <IconButton aria-label='返回' onClick={() => { navigate('..') }}
            sx={{ mr: 1 }}>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h6' gutterBottom={false} sx={{ flex: 1 }}>
            用户详细资料
          </Typography>
          <Tooltip title='打印'>
            <IconButton aria-label='打印' onClick={print}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <BaseInfoTable profile={profile} />
        <Typography variant='subtitle1' sx={{ mt: 2, mb: 1 }}>登录历史</Typography>
        <SigninHistory history={profile.history || []} />
      </Paper>
    </Container>
  )
}

function BaseInfoTable(props) {
  const { profile } = props;

  return (
    <TableContainer component={OutlinedPaper}>
      <Table>
        <TableBody sx={{
          'td:not(:last-child)': {
            borderRight: '1px solid #8884',
          },
          'td:nth-of-type(2n+1)': {
            width: '1%', whiteSpace: 'nowrap',
          },
          'tr:last-child td': {
            borderBottom: 0,
          }
        }}>
          <TableRow>
            <TableCell>登录名</TableCell>
            <TableCell>{profile.userid}</TableCell>
            <TableCell>姓名</TableCell>
            <TableCell>{profile.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>手机号</TableCell>
            <TableCell>{profile.mobile}</TableCell>
            <TableCell>邮箱地址</TableCell>
            <TableCell>{profile.email}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>联系地址</TableCell>
            <TableCell colSpan={3}>{profile.address}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>创建时间</TableCell>
            <TableCell>
              {dayjs(profile.create_at).format('YYYY/MM/DD HH:mm:ss')}
            </TableCell>
            <TableCell>最后更新时间</TableCell>
            <TableCell>
              {dayjs(profile.update_at).format('YYYY/MM/DD HH:mm:ss')}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>最后登录时间</TableCell>
            <TableCell>
              {dayjs(profile.signin_at).format('YYYY/MM/DD HH:mm:ss')}
            </TableCell>
            <TableCell>登录次数</TableCell>
            <TableCell>{profile.n_signin}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>状态</TableCell>
            <TableCell>
              {profile.deleted ? '已删除' : profile.disabled ? '已禁用' : '正常'}
            </TableCell>
            <TableCell>需验证码登录</TableCell>
            <TableCell>{profile.tfa ? '是' : '否'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>访问控制</TableCell>
            <TableCell colSpan={3}>
              {profile.acl?.name}（{profile.acl?.summary}）
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>安全操作码</TableCell>
            <TableCell>{profile.secretcode_isset ? '已设置' : '未设置'}</TableCell>
            <TableCell>两因素认证</TableCell>
            <TableCell>{profile.totp_isset ? '已设置' : '未设置'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>绑定层级</TableCell>
            <TableCell colSpan={3}>
              {profile.node ? `${profile.node.name}，${profile.node.nlevel} 级` : '无'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function SigninHistory(props) {
  const { history } = props;

  return (
    <TableContainer component={OutlinedPaper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">登录时间</TableCell>
            <TableCell align="center">登录名</TableCell>
            <TableCell align="center">姓名</TableCell>
            <TableCell align="center">设备</TableCell>
            <TableCell align="center">位置</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.length === 0 ?
            <TableRow>
              <TableCell align='center' colSpan={5}>没有登录记录</TableCell>
            </TableRow>
            :
            history.map((row, index) => (
              <TableRow key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">
                  {dayjs(row.create_at).format('YY/MM/DD HH:mm:ss')}
                </TableCell>
                <TableCell align="center">{row.userid}</TableCell>
                <TableCell align="center">{row.name}</TableCell>
                <TableCell align="center">{row.browser} on {row.os}</TableCell>
                <TableCell align="center">
                  <Tooltip title={row.ip} arrow placement='right'>
                    <Typography variant='body2' sx={{ cursor: 'default' }}>
                      {geo(row) || row.ip}
                    </Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
