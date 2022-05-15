import { useEffect, useRef, useState } from 'react';
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
import PrintIcon from '@mui/icons-material/Print';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import OutlinedPaper from '~/comp/outlined-paper';
import SecretText from '~/comp/secret-text';
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import { get } from '~/lib/rest';

export default function Info() {
  const location = useLocation();
  const navigate = useNavigate();
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [sms, setSMS] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('短信服务配置信息');

  const contentRef = useRef();
  const print = usePrint(contentRef.current);

  useEffect(() => {
    (async () => {
      try {
        if (location.state) {
          setProgress(true);

          const params = new URLSearchParams({ uuid: location.state.uuid });
          const resp = await get('/system/setting/sms/info?' + params.toString());
          setSMS(resp);
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
    <Stack spacing={3}>
      <Stack direction='row' alignItems='center'>
        <IconButton onClick={() => { navigate('..') }} sx={{ mr: 1 }}>
          <ArrowBackIcon color='primary' />
        </IconButton>
        <Typography variant='h4' gutterBottom={false} sx={{ flex: 1 }}>
          短信服务配置信息
        </Typography>
        <IconButton onClick={print}>
          <PrintIcon />
        </IconButton>
      </Stack>
      <TableContainer component={OutlinedPaper} ref={contentRef}>
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
              <TableCell>运营商</TableCell>
              <TableCell>{sms.isp_name}</TableCell>
              <TableCell>简称</TableCell>
              <TableCell>{sms.isp}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Appid</TableCell>
              <TableCell>{sms.appid}</TableCell>
              <TableCell>短信签名</TableCell>
              <TableCell>{sms.prefix}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Secret Id</TableCell>
              <TableCell>{sms.secret_id}</TableCell>
              <TableCell>Secret Key</TableCell>
              <TableCell>
                <SecretText text={sms.secret_key} variant='body2'></SecretText>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>创建时间</TableCell>
              <TableCell>{dayjs(sms.create_at).format('LL dddd HH:mm:ss')}</TableCell>
              <TableCell>更新时间</TableCell>
              <TableCell>{dayjs(sms.update_at).format('LL dddd HH:mm:ss')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>序号</TableCell>
              <TableCell>{sms.sortno}</TableCell>
              <TableCell>发信量</TableCell>
              <TableCell>{sms.nsent}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant='h6'>正文模版</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>通用验证码</TableCell>
              <TableCell colSpan={3}>{sms.textno1}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
