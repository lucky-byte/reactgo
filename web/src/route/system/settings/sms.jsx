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
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import isInt from 'validator/lib/isInt';
import InplaceInput from '~/comp/inplace-input';
import OutlinedPaper from '~/comp/outlined-paper';
import { get, put, post } from "~/rest";

export default function SMS() {
  const { enqueueSnackbar } = useSnackbar();
  const [appid, setAppid] = useState('');
  const [secretId, setSecretId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [sign, setSign] = useState('');
  const [msgids, setMsgids] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/settings/sms/config');
        setAppid(resp.appid);
        setSecretId(resp.secret_id);
        setSecretKey(resp.secret_key);
        setSign(resp.sign);

        const ids = []
        ids[1] = resp.msgid1;
        setMsgids(ids);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  const onChangeAppid = async appid => {
    try {
      if (!isInt(appid)) {
        return enqueueSnackbar('APPID 只能包含数字', { variant: 'warning' });
      }
      await put('/system/settings/sms/appid', new URLSearchParams({ appid }));
      setAppid(appid);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onChangeSecretId = async secret_id => {
    try {
      await put('/system/settings/sms/secretid', new URLSearchParams({ secret_id }));
      setSecretId(secret_id);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onChangeSecretKey = async secret_key => {
    try {
      await put('/system/settings/sms/secretkey', new URLSearchParams({ secret_key }));
      setSecretKey(secret_key);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onChangeSign = async sign => {
    try {
      await put('/system/settings/sms/sign', new URLSearchParams({ sign }));
      setSign(sign);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const updateMsgid = (id, n) => {
    const ids = [...msgids]
    ids[n] = id;
    setMsgids(ids)
  }

  return (
    <Stack>
      <FormHelperText sx={{ textAlign: 'center', mt: 1 }}>
        配置前请先注册腾讯短信服务，注册地址:&nbsp;
        <Link component='a'
          href='https://cloud.tencent.com/product/sms' target='_blank'>
          https://cloud.tencent.com/product/sms
        </Link>
      </FormHelperText>
      <FormHelperText sx={{ mt: 3 }}>
        可以在腾讯短信管理后台
        <Link component='a' target='_blank'
          href='https://console.cloud.tencent.com/smsv2/app-manage'>
          应用列表
        </Link>
        中查询 SDK AppId，在腾讯云后台
        <Link component='a' target='_blank'
          href='https://console.cloud.tencent.com/cam/capi'>
          API密钥管理
        </Link>
        中查询 Secret Id 及 Secret Key。
      </FormHelperText>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction='row' alignItems='center'>
            <Typography sx={{ minWidth: 80 }} variant='subtitle2'>
              SDK AppId:
            </Typography>
            <InplaceInput sx={{ flex: 1 }} text={appid} placeholder='请填写'
              color="primary" onConfirm={onChangeAppid}
            />
          </Stack>
          <Stack direction='row' alignItems='center'>
            <Typography sx={{ minWidth: 80 }} variant='subtitle2'>
              Secret Id:
            </Typography>
            <InplaceInput sx={{ flex: 1 }} text={secretId} placeholder='请填写'
              color="primary" onConfirm={onChangeSecretId}
            />
          </Stack>
          <Stack direction='row' alignItems='baseline'>
            <Typography sx={{ minWidth: 80 }} variant='subtitle2'>
              Secret Key:
            </Typography>
            <InplaceInput sx={{ flex: 1 }} text={secretKey} placeholder='请填写'
              color="primary" onConfirm={onChangeSecretKey}
            />
          </Stack>
        </Stack>
      </Paper>
      <FormHelperText sx={{ mt: 3 }}>
        国内短信须包含签名（即短信【】中的内容），签名需要先在腾讯短信后台
        <Link component='a'
          href='https://console.cloud.tencent.com/smsv2/csms-sign'
          target='_blank'>
          签名管理
        </Link>
        中申请，通过后再回填到这里。
      </FormHelperText>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction='row' alignItems='center'>
          <Typography sx={{minWidth: 70}} variant='subtitle2'>短信签名:</Typography>
          <InplaceInput sx={{ flex: 1, ml: 1 }} text={sign} placeholder='请填写'
            color="primary" onConfirm={onChangeSign}
          />
        </Stack>
      </Paper>
      <Typography sx={{ mt: 3 }} variant='subtitle1'>正文模板</Typography>
      <FormHelperText sx={{ mb: 0 }}>
        按照下表提供的内容，在腾讯短信
        <Link component='a'
          href='https://console.cloud.tencent.com/smsv2/csms-template'
          target='_blank'>
          正文模板管理
        </Link>
        中创建正文模板，审核通过后，
        将得到的模板编号回填到下表模板编号中。
      </FormHelperText>
      <TableContainer component={OutlinedPaper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">模板名称</TableCell>
              <TableCell align="center">模板正文</TableCell>
              <TableCell align="center">模板编号</TableCell>
              <TableCell as='td' align="center" padding="checkbox"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="center">验证码</TableCell>
              <TableCell align="center">
                您的验证码是 <NumberTip n={1} tip='短信验证码' />，10分钟内有效
              </TableCell>
              <TableCell align="center">{msgids[1] || '空'}</TableCell>
              <TableCell align="center" padding="checkbox">
                <MenuButton name='验证码' n={1} msgid={msgids[1]} updateMsgid={updateMsgid} />
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

function MenuButton(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [modifyOpen, setModifyOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  const { name, n, msgid, updateMsgid } = props;

  const onOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  }

  const onModify = () => {
    onClose();
    setModifyOpen(true);
  }

  const onTest = () => {
    onClose();
    setTestOpen(true);
  }

  return (
    <div>
      <IconButton aria-label="菜单" onClick={onOpen}>
        <MoreVertIcon color='primary' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <MenuItem onClick={onModify}>修改模板编号</MenuItem>
        <MenuItem onClick={onTest}>发送测试短信</MenuItem>
      </Menu>
      <ModifyDialog open={modifyOpen} onClose={() => setModifyOpen(false) }
        name={name} n={n} msgid={msgid} updateMsgid={updateMsgid}
      />
      <TestDialog open={testOpen} onClose={() => setTestOpen(false)}
        name={name} n={n} msgid={msgid} updateMsgid={updateMsgid}
      />
    </div>
  )
}

function ModifyDialog(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [id, setId] = useState('');

  const { open, onClose, name, n, msgid, updateMsgid } = props;

  useEffect(() => { setId(msgid); }, [msgid]);

  const onConfirm = async () => {
    try {
      if (id !== msgid) {
        if (!isInt(id)) {
          return enqueueSnackbar('模板编号只能包含数字', { variant: 'warning' });
        }
        await put('/system/settings/sms/msgid', new URLSearchParams({ id, n }));
        updateMsgid(id, n);
        setId('');
        enqueueSnackbar('更新成功', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs'>
      <DialogTitle>修改模板编号</DialogTitle>
      <DialogContent>
        <DialogContentText>模板名称: {name}</DialogContentText>
        <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
          <TextField
            autoFocus
            label="模板编号"
            fullWidth
            variant="standard"
            value={id}
            onChange={e => setId(e.target.value)}
            inputProps={{ maxLength: 16 }}
            helperText='请填写正确的模板编号，建议填写后发送测试短信进行验证。'
          />
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" onClick={onConfirm}>修改</Button>
      </DialogActions>
    </Dialog>
  )
}

function TestDialog(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [mobile, setMobile] = useState('');
  const [params, setParams] = useState('');

  const { open, onClose, name, n } = props;

  const onConfirm = async () => {
    try {
      if (!/^1[0-9]{10}$/.test(mobile)) {
        return enqueueSnackbar('请输入正确手机号', { variant: 'warning' });
      }
      await post('/system/settings/sms/test', new URLSearchParams({
        n, mobile, params: params.split(/[,，]/),
      }));
      enqueueSnackbar('短信已发送', { variant: 'success' });
      setMobile('');
      setParams('');
      onClose();
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs'>
      <DialogTitle>发送测试短信</DialogTitle>
      <DialogContent>
        <DialogContentText>模板名称: {name}</DialogContentText>
        <FormHelperText>发送短信将产生运营商费用，请知悉。</FormHelperText>
        <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
          <TextField
            autoFocus
            type="tel"
            label="手机号"
            fullWidth
            variant="standard"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            inputProps={{ maxLength: 11 }}
            helperText='短信将发送到该手机号'
          />
          <TextField
            label="参数"
            fullWidth
            variant="standard"
            value={params}
            onChange={e => setParams(e.target.value)}
            sx={{ mt: 3 }}
            helperText='短信正文中 {n} 的内容，请按照模板规范顺序填写，如有多个参数请用逗号(,)分隔'
          />
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" onClick={onConfirm}>发送</Button>
      </DialogActions>
    </Dialog>
  )
}
