import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import { useSnackbar } from 'notistack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import InplaceInput from '../../../comp/inplace-input';
import CellInput from '../../../comp/cell-input';
import OutlinedPaper from '../../../comp/outlined-paper';
import { get, put } from "../../../rest";

export default function SMS() {
  const { enqueueSnackbar } = useSnackbar();
  const [appid, setAppid] = useState('');
  const [appkey, setAppkey] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/settings/sms');
        setAppid(resp.appid);
        setAppkey(resp.appkey);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  const onChangeAppid = async v => {
    try {
      await put('/system/settings/sms/appid', new URLSearchParams({
        appid: v,
      }));
      setAppid(v);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onChangeAppkey = async v => {
    try {
      await put('/system/settings/sms/appkey', new URLSearchParams({
        appkey: v,
      }));
      setAppkey(v);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <FormHelperText sx={{ textAlign: 'center', mt: 1 }}>
        配置前请先注册腾讯短信服务，注册地址：
        <Link component='a'
          href='https://cloud.tencent.com/product/sms' target='_blank'>
          https://cloud.tencent.com/product/sms
        </Link>
      </FormHelperText>
      <FormHelperText sx={{ mt: 3 }}>
        请在腾讯短信管理后台应用管理中查询 appid 和 appkey 信息。
      </FormHelperText>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction='row' alignItems='center'>
          <Typography sx={{minWidth: 70}} variant='subtitle2'>AppId:</Typography>
          <InplaceInput sx={{ flex: 1, ml: 1 }} text={appid}
            onConfirm={onChangeAppid}
          />
        </Stack>
        <Stack direction='row' alignItems='center'>
          <Typography sx={{minWidth: 70}} variant='subtitle2'>AppKey:</Typography>
          <InplaceInput sx={{ flex: 1, ml: 1 }} text={appkey}
            onConfirm={onChangeAppkey}
          />
        </Stack>
      </Paper>
      <FormHelperText sx={{ mt: 3 }}>
        国内短信须包含签名（即短信【】中的内容），
        签名需要先在腾讯短信后台签名管理中申请，通过后再回填到这里。
      </FormHelperText>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction='row' alignItems='center'>
          <Typography sx={{minWidth: 70}} variant='subtitle2'>短信签名:</Typography>
          <InplaceInput sx={{ flex: 1, ml: 1 }} text={appkey}
            onConfirm={onChangeAppkey}
          />
        </Stack>
      </Paper>
      <Typography sx={{ mt: 3 }} variant='subtitle1'>正文模板:</Typography>
      <FormHelperText sx={{ mb: 0 }}>
        按照下表提供的内容，在腾讯短信正文模板管理中创建正文模板，审核通过后，
        将得到的模板编号回填到下表模板编号中。
      </FormHelperText>
      <TableContainer component={OutlinedPaper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">模板名称</TableCell>
              <TableCell align="center">正文</TableCell>
              <TableCell align="center">模板编号</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center">验证码</TableCell>
              <TableCell align="center">验证码&nbsp;
                <NumberTip n={1} tip='短信验证码变量' />
                ，5分钟内有效
                ，5分钟内有效
              </TableCell>
              <TableCell align="center">
                <CellInput variant='body2' sx={{justifyContent:'center'}} text='未填写' />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

function NumberTip(props) {
  return (
    <Tooltip title={props.tip}>
      <Typography component='span' color='primary' sx={{ cursor: 'pointer' }}>
        {'{'}{props.n}{'}'}
      </Typography>
    </Tooltip>
  )
}
