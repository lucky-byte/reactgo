import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from "@mui/material/Button";
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import isEmail from 'validator/lib/isEmail';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import Banner from '~/img/banner.png';
import BannerDark from '~/img/banner-dark.png';
import { put, post } from "~/rest";

export default function ResetPass() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [id, setId] = useState('');
  const [time, setTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const Logo = theme.palette.mode === 'dark' ? BannerDark : Banner;

  useHotkeys('esc', () => { navigate('/signin'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { document.title = '找回登录密码'; }, []);

  // 登录名改变
  const onUsernameChange = e => {
    setUsername(e.target.value);
  }

  // 邮箱地址改变
  const onEmailChange = e => {
    setEmail(e.target.value);
  }

  // 验证码改变
  const onCodeChange = e => {
    setCode(e.target.value);
  }

  // 验证码输入框回车
  const onCodeKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  useEffect(() => {
    if (time > 0) {
      const timer = setTimeout(() => { setTime(time - 1); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [time]);

  // 获取验证码
  const onSendCode = async () => {
    try {
      if (!username || !email) {
        return enqueueSnackbar('请先输入用户名和邮箱地址', { variant: 'warning' });
      }
      if (!isEmail(email)) {
        return enqueueSnackbar('邮箱地址格式错误', { variant: 'warning' });
      }
      const resp = await post('/resetpass/emailcode', new URLSearchParams({
        username, email,
      }));
      if (!resp?.id) {
        throw new Error('响应数据无效');
      }
      setId(resp.id);
      enqueueSnackbar('验证码已发送到邮箱，请查收', { variant: 'success' });
      setTime(60);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onSubmit = async () => {
    if (!username || !email || !code) {
      return enqueueSnackbar('信息不完整，请录入', { variant: 'warning' });
    }
    if (!isEmail(email)) {
      return enqueueSnackbar('邮箱地址格式错误', { variant: 'warning' });
    }
    if (!id) {
      return enqueueSnackbar('请获取验证码', { variant: 'warning' });
    }
    try {
      setSubmitting(true);

      const resp = await put('/resetpass/emailverify', new URLSearchParams({
        username, email, code, id
      }));
      setSubmitting(false);

      if (!resp?.smsid || !resp?.mobile) {
        throw new Error('服务器响应数据无效');
      }
      navigate('/resetpass/sms', {
        state: {
          smsid: resp.smsid, mobile: resp.mobile, username, email,
        }
      });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
      setSubmitting(false);
    }
  }

  return (
    <Stack as='main' role='main'>
      <Toolbar>
        <Box sx={{ flex: 1 }}>
          <Link component='a' href='/signin'>
            <img src={Logo} alt='Logo' height='28px' />
          </Link>
        </Box>
        <Button variant='outlined' sx={{ mt: 1 }}
          LinkComponent={RouteLink} to='/signin'>
          登录
        </Button>
      </Toolbar>
      <Container maxWidth='xs'
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ mt: 4, py: 3, px: 4, width: '100%' }}>
          <Typography as='h1' variant='h6' sx={{ mt: 1 }}>找回登录密码</Typography>
          <FormHelperText>
            找回登录密码需要验证您的账号邮箱地址和手机号，如果邮箱地址或手机号已变更，
            请联系管理员
          </FormHelperText>
          <TextField fullWidth required
            label='登录名' placeholder="登录名"
            autoComplete="username" variant='standard'
            value={username} onChange={onUsernameChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 3 }}
          />
          <TextField fullWidth required
            label='邮箱地址' placeholder="账号邮箱地址"
            autoComplete="email" variant='standard' type='email'
            value={email} onChange={onEmailChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 3 }}
          />
          <TextField required
            label='邮箱验证码' placeholder="6位数字验证码"
            fullWidth variant='standard'
            value={code} onChange={onCodeChange}
            onKeyDown={onCodeKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon />
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
            helperText='点击获取验证码，系统将验证码发送到您的邮箱'
            sx={{ mt: 4 }}
          />
          <Button fullWidth variant="contained" size="large" sx={{ mt: 4 }}
            onClick={onSubmit} disabled={code.length < 6 || submitting}>
            提交
          </Button>
        </Paper>
      </Container>
    </Stack>
  )
}
