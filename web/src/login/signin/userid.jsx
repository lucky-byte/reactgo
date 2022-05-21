import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import DialpadIcon from '@mui/icons-material/Dialpad';
import KeyIcon from '@mui/icons-material/Key';
import { useSnackbar } from 'notistack';
import isMobile from 'validator/lib/isMobilePhone';
import { post } from "~/login/fetch";

// 找回登录名
export default function ForgetUserid() {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [smsid, setSmsid] = useState('');
  const [list, setList] = useState([]);
  const [time, setTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [copyTip, setCopyTip] = useState('');

  const onOpen = () => {
    setOpen(true);
  }

  const onClose = () => {
    setMobile('');
    setCode('');
    setSmsid('');
    setList([]);
    setOpen(false);
  };

  // 手机号改变
  const onMobileChange = e => {
    setMobile(e.target.value);
  }

  // 验证码改变
  const onCodeChange = e => {
    setCode(e.target.value);
  }

  // 验证码输入框回车
  const onCodeKeyDown = e => {
    e.stopPropagation(); // 避免事件传递到登录输入框

    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  // 更新计时器
  useEffect(() => {
    if (time > 0) {
      const timer = setTimeout(() => { setTime(time - 1); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [time]);

  // 获取验证码
  const onSendCode = async () => {
    try {
      if (!isMobile(mobile, 'zh-CN')) {
        return enqueueSnackbar('请输入正确手机号', { variant: 'info' });
      }
      const resp = await post('/signin/userid/code', new URLSearchParams({
        mobile,
      }));
      if (!resp?.smsid) {
        throw new Error('响应数据无效');
      }
      setSmsid(resp.smsid);
      enqueueSnackbar('验证码已发送', { variant: 'success' });
      setTime(60);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 提交查询
  const onSubmit = async () => {
    try {
      if (!isMobile(mobile, 'zh-CN')) {
        return enqueueSnackbar('请输入正确手机号', { variant: 'info' });
      }
      if (!smsid) {
        return enqueueSnackbar('请获取短信验证码', { variant: 'warning' });
      }
      if (!code) {
        return enqueueSnackbar('请输入短信验证码', { variant: 'warning' });
      }
      setSubmitting(true);

      const resp = await post('/signin/userid/search', new URLSearchParams({
        mobile, smsid, code,
      }));
      if (!resp?.list) {
        return enqueueSnackbar('响应数据无效');
      }
      setList(resp.list);
      setSmsid('');
      setCode('');
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const onCopyUserId = userid => {
    navigator.clipboard.writeText(userid);
    setCopyTip('已复制 ' + userid);
    setTimeout(() => setCopyTip(''), 1000)
  }

  return (
    <>
      <Button size="small" onClick={onOpen}>忘记登录名</Button>
      <Dialog open={open} onClose={onClose} maxWidth='xs'>
        <DialogTitle sx={{ pb: 0 }}>找回登录名</DialogTitle>
        <DialogContent>
          <DialogContentText variant="caption">
            找回登录名需要验证您的手机号，如果手机号已变更，请联系技术支持
          </DialogContentText>
          <TextField fullWidth required autoFocus
            label='手机号' placeholder="账号手机号"
            autoComplete="mobile" variant='standard' type='tel'
            value={mobile} onChange={onMobileChange}
            inputProps={{ maxLength: 11 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DialpadIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 3 }}
          />
          <TextField required
            label='验证码' placeholder="6位数字验证码"
            fullWidth variant='standard'
            value={code} onChange={onCodeChange}
            onKeyDown={onCodeKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button disabled={time > 0} onClick={onSendCode}>
                    {time > 0 ? `${time} 秒` : '获取验证码'}
                  </Button>
                </InputAdornment>
              ),
            }}
            inputProps={{ maxLength: 6 }}
            helperText='点击获取验证码，系统将验证码发送到您的手机'
            sx={{ mt: 4 }}
          />
          <Collapse in={list.length > 0}>
            <Paper variant='outlined' sx={{ p: 2, mt: 2 }}>
              <Typography variant="caption" paragraph>
                该手机号已绑定下列登录名:
              </Typography>
              <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
                {list.map(item => (
                  <Chip key={item.userid} label={item.userid}
                    variant="outlined" color="success"
                    avatar={item.avatar ?
                      <Avatar alt={item.userid} src={`/image/?u=${item.avatar}`} />
                      : null
                    }
                    sx={{ mb: 1 }}
                    onClick={() => {onCopyUserId(item.userid)}}
                  />
                ))}
              </Stack>
            </Paper>
            <Typography variant="caption">{copyTip}</Typography>
          </Collapse>
        </DialogContent>
        <DialogActions sx={{ mx: 3, my: 2 }}>
          <Button onClick={onClose} color='secondary'>关闭</Button>
          <Button onClick={onSubmit} variant='contained' disabled={submitting}>
            找回登录名
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
