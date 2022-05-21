import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link as RouteLink } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
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
import useTitle from "~/hook/title";
import Banner from '~/comp/banner';
import { post, put } from "~/login/fetch";

export default function SMS() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [smsid, setSmsid] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(60);

  useTitle('短信验证');

  // 获取路由参数
  useEffect(() => {
    if (!location?.state) {
      return navigate('/resetpass', { replace: true });
    }
    setMobile(location.state?.mobile);
    setSmsid(location.state?.smsid);
    setUsername(location.state?.username);
    setEmail(location.state?.email);
  }, [navigate, location?.state]);

  // 更新计时器
  useEffect(() => {
    const timer = setTimeout(() => { setTime(time - 1); }, 1000);
    return () => { clearTimeout(timer); }
  }, [time]);

  // 验证码改变
  const onCodeChange = e => {
    setCode(e.target.value);
  }

  // 回车
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

      await put('/resetpass/smsverify', new URLSearchParams({
        username, mobile, smsid, code
      }));
      setLoading(false);
      navigate('../success', { replace: true, state: { email } });
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 重新发送验证码
  const onSendCode = async () => {
    try {
      const resp = await post('/resetpass/smsresend', new URLSearchParams({
        mobile, username,
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
    <Stack as='main' role='main'>
      <Toolbar>
        <Box sx={{ flex: 1 }}>
          <Link component={RouteLink} to='/signin'>
            <Banner height={28} />
          </Link>
        </Box>
      </Toolbar>
      <Container maxWidth='xs'
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ mt: 6, py: 3, px: 4, width: '100%' }}>
          <Typography as='h1' variant='h6' sx={{ mt: 1 }}>短信认证</Typography>
          <Typography variant='caption' paragraph>
            短信验证码已发送到尾号为 {mobile?.substring(7)} 的手机，请输入短信中的验证码完成验证
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
                endAdornment: (
                <InputAdornment position="end">
                  <Button disabled={time > 0} onClick={onSendCode}>
                    {time > 0 ? `${time} 秒` : '获取短信验证码'}
                  </Button>
                </InputAdornment>
                )
              }}
            />
            {time > 0 ?
              <FormHelperText sx={{ mx: 0, my: 1 }}>
                没有收到验证码？请等待 {time} 秒后尝试重新获取，如尝试多次无效，请联系工作人员
              </FormHelperText>
              :
              <FormHelperText sx={{ mx: 0, my: 1 }}>
                没有收到验证码？请尝试重新获取，如尝试多次无效，请联系工作人员
              </FormHelperText>
            }
          </FormControl>
          <Button fullWidth variant="contained" size="large" sx={{ mt: 4 }}
            onClick={onSubmit} disabled={loading}>
            验证
          </Button>
        </Paper>
      </Container>
    </Stack>
  )
}
