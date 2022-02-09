import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import OutlinedPaper from '~/comp/outlined-paper';
import titleState from "~/state/title";
import progressState from '~/state/progress';
import { get } from '~/rest';

export default function Info() {
  const location = useLocation();
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [mta, setMta] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('邮件传输代理配置信息'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        if (location.state) {
          setProgress(true);

          const params = new URLSearchParams({ uuid: location.state.uuid });
          const resp = await get('/system/settings/mail/info?' + params.toString());
          setMta(resp);
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
    <Stack>
      <Stack direction='row' alignItems='center' sx={{ mb: 3, mt: 3 }}>
        <IconButton onClick={() => { navigate('..') }} sx={{ mr: 1 }}>
          <ArrowBackIcon color='primary' />
        </IconButton>
        <Typography variant='h6' gutterBottom={false}>详细信息</Typography>
      </Stack>
      <BaseInfoTable mta={mta} />
    </Stack>
  )
}

function BaseInfoTable(props) {
  const { mta } = props;

  return (
    <TableContainer component={OutlinedPaper}>
      <Table>
        <TableBody sx={{ 'td': { borderColor: '#8884' } }}>
          <TableRow>
            <TableCell>名称</TableCell>
            <TableCell sx={{ borderLeft: '1px solid', borderRight: '1px solid' }}>
              {mta.name}
            </TableCell>
            <TableCell>标题前缀</TableCell>
            <TableCell sx={{ borderLeft: '1px solid' }}>
              {mta.prefix}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>主机</TableCell>
            <TableCell colSpan={3} sx={{ borderLeft: '1px solid' }}>
              {mta.host}:{mta.port} / {mta.ssl ? 'SSL' : 'StartTLS'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>发件人地址</TableCell>
            <TableCell colSpan={3} sx={{ borderLeft: '1px solid' }}>
              {mta.sender}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>回复地址</TableCell>
            <TableCell colSpan={3} sx={{ borderLeft: '1px solid' }}>
              {mta.replyto}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>用户名</TableCell>
            <TableCell sx={{ borderLeft: '1px solid', borderRight: '1px solid' }}>
              {mta.username}
            </TableCell>
            <TableCell>密码</TableCell>
            <TableCell sx={{ borderLeft: '1px solid' }}>
              {mta.passwd ? '******' : ''}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>抄送地址</TableCell>
            <TableCell colSpan={3} sx={{ borderLeft: '1px solid' }}>
              {mta.cc}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>密送地址</TableCell>
            <TableCell colSpan={3} sx={{ borderLeft: '1px solid' }}>
              {mta.bcc}
            </TableCell>
          </TableRow>
          <TableRow sx={{ td: { borderBottom: 0 } }}>
            <TableCell>序号</TableCell>
            <TableCell sx={{ borderLeft: '1px solid', borderRight: '1px solid' }}>
              {mta.sortno}
            </TableCell>
            <TableCell>发送量</TableCell>
            <TableCell sx={{ borderLeft: '1px solid' }}>
              {mta.nsent}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
