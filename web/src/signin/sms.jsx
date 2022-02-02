import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil"
import { useLocation, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import KeyIcon from '@mui/icons-material/Key';
import { useSnackbar } from 'notistack';
import userState from "~/state/user";
import { post, put } from "~/rest";

export default function SignInSMS() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useRecoilValue(userState);
  const { enqueueSnackbar } = useSnackbar();
  const [smsid, setSmsid] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(60);

  useEffect(() => {
    if (!location?.state?.smsid) {
      return navigate('/signin', { replace: true });
    }
    setSmsid(location.state.smsid);

    const token = localStorage.getItem('token');
    if (!token || !user || !user.userid) {
      return navigate('/signin', { replace: true });
    }
  }, [user, navigate, location?.state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (time > 0) {
        setTime(time - 1);
      } else {
        clearTimeout(timer);
      }
    }, 1000);
    return () => { clearTimeout(timer); }
  }, [time]);

  const onCodeChange = e => {
    setCode(e.target.value);
  }

  const onCodeKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  const onSubmit = async () => {
    if (code.length !== 6) {
      return enqueueSnackbar('请输入完整的短信验证码', {
        variant: 'warning', preventDuplicate: true,
      });
    }
    try {
      setLoading(true);

      const resp = await put('/signin/smsverify', new URLSearchParams({
        mobile: user.mobile, smsid, code
      }));
      if (!resp || !resp.token) {
        return enqueueSnackbar('服务器响应数据不完整', { variant: 'error' });
      }
      localStorage.setItem('token', resp.token);

      setLoading(false);

      // 跳转到最近访问页面
      let last_access = localStorage.getItem('last-access');
      localStorage.removeItem('last-access');
      if (last_access?.startsWith('/signin')) {
        last_access = '/';
      }
      navigate(last_access || '/', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 重新发送验证码
  const onReSendClick = async () => {
    try {
      const resp = await post('/signin/smsresend', new URLSearchParams({
        mobile: user.mobile
      }));
      if (!resp.smsid) {
        throw new Error('响应数据无效');
      }
      setSmsid(resp.smsid);
      setTime(60);
    } catch (err) {
      enqueueSnackbar(err.message)
    }
  }

  return (
    <Container as='main' role='main' maxWidth='xs' sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems:'center',
    }}>
      <Paper elevation={3} sx={{ mt: 10, py: 3, px: 4, width: '100%' }}>
        <Typography as='h1' variant='caption' sx={{mt:1}}>
          短信验证码已发送到手机号 ****{user?.mobile?.substring(7)}，请输入短信验证码完成验证
        </Typography>
        <FormControl fullWidth sx={{ mt: 3 }}>
          <TextField required autoFocus autoComplete="off"
            label='短信验证码' placeholder="请输入短信验证码"
            variant='outlined' value={code} onChange={onCodeChange}
            onKeyDown={onCodeKeyDown}
            inputProps={{ maxLength: 6, minLength: 6 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon />
                </InputAdornment>
              ),
            }}
          />
          {time > 0 ?
            <FormHelperText sx={{ mx: 0, my: 1 }}>
              没有收到验证码？请等待 {time} 秒后尝试重新获取，如尝试多次无效，请联系工作人员
            </FormHelperText>
            :
            <Button size='small' sx={{ mt: 1 }} color='warning' onClick={onReSendClick}>
              重新获取验证码
            </Button>
          }
        </FormControl>
        <Button fullWidth variant="contained" size="large" sx={{ mt: 4 }}
          onClick={onSubmit} disabled={loading}>
          验证
        </Button>
      </Paper>
    </Container>
  )
}
