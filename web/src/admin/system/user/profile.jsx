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
import { get } from '~/lib/rest';
import { location } from '~/lib/geo';

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
          setProfile(resp || {});
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
        <Stack direction='row' alignItems='center' sx={{ mb: 3 }} spacing={1}>
          <IconButton aria-label='返回' onClick={() => { navigate('..') }}>
            <Tooltip arrow title='ESC' placement='top'>
              <ArrowBackIcon color='primary' />
            </Tooltip>
          </IconButton>
          <Typography variant='h5' gutterBottom={false} sx={{ flex: 1 }}>
            用户详细资料
          </Typography>
          <Tooltip title='打印'>
            <IconButton aria-label='打印' onClick={print}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <BaseInfoTable profile={profile} />
        <Typography variant='subtitle1' sx={{ mt: 2, mb: 1 }}>
          登录历史({profile.history?.length || 0})
        </Typography>
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
            <TableCell>唯一标识</TableCell>
            <TableCell colSpan={3}>{profile.uuid}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>手机号</TableCell>
            <TableCell>{profile.mobile}</TableCell>
            <TableCell>邮箱地址</TableCell>
            <TableCell>{profile.email}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>身份证号</TableCell>
            <TableCell colSpan={3}>{profile.idno}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>联系地址</TableCell>
            <TableCell colSpan={3}>{profile.address}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>银行账号</TableCell>
            <TableCell>{profile.acct_no}</TableCell>
            <TableCell>开户人</TableCell>
            <TableCell>{profile.acct_name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>账户身份证号</TableCell>
            <TableCell>{profile.acct_idno}</TableCell>
            <TableCell>账户手机号</TableCell>
            <TableCell>{profile.acct_mobile}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>开户银行</TableCell>
            <TableCell colSpan={3}>{profile.acct_bank_name}</TableCell>
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
            <TableCell>一次性密码</TableCell>
            <TableCell>{profile.totp_isset ? '已设置' : '未设置'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>绑定层级</TableCell>
            <TableCell colSpan={3}>
              {profile.node ? `${profile.node.name}，${profile.node.nlevel} 级` : '无'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>授权账号</TableCell>
            <TableCell colSpan={3}>{profile.oauth || '无'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>创建时间</TableCell>
            <TableCell>
              {dayjs(profile.create_at).format('LL LTS')}
            </TableCell>
            <TableCell>最后更新时间</TableCell>
            <TableCell>
              {dayjs(profile.update_at).format('LL LTS')}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>最后登录时间</TableCell>
            <TableCell>
              {dayjs(profile.signin_at).format('LL LTS')}
            </TableCell>
            <TableCell>登录次数</TableCell>
            <TableCell>{profile.n_signin}</TableCell>
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
            <TableCell align="center">系统</TableCell>
            <TableCell align="center">浏览器</TableCell>
            <TableCell align="center">位置</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.length === 0 ?
            <TableRow>
              <TableCell align='center' colSpan={10}>没有登录记录</TableCell>
            </TableRow>
            :
            history.map((row, index) => (
              <TableRow key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">
                  {dayjs(row.create_at).format('LL LTS')}
                </TableCell>
                <TableCell align="center">{row.userid}</TableCell>
                <TableCell align="center">{row.name}</TableCell>
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
  )
}
