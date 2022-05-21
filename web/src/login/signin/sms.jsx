import { useEffect, useState } from "react";
import { useRecoilState } from "recoil"
import { useLocation, useNavigate, Link as RouteLink } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import Checkbox from '@mui/material/Checkbox';
import KeyIcon from '@mui/icons-material/Key';
import { useSnackbar } from 'notistack';
import userState from "~/state/user";
import useTitle from "~/hook/title";
import { getLastAccess } from '~/lib/last-access';
import Banner from '~/comp/banner';
import { post, put } from "~/login/fetch";

export default function SignInSMS() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useRecoilState(userState);
  const { enqueueSnackbar } = useSnackbar();
  const [trust, setTrust] = useState(false);
  const [mobile, setMobile] = useState('');
  const [smsid, setSmsid] = useState('');
  const [totp, setTotp] = useState('');
  const [historyId, setHistoryId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);

  useTitle('短信验证');

  // 获取页面传入的数据
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return navigate('/signin', { replace: true });
    }
    if (location.state?.smsid) {
      setSmsid(location.state.smsid);
      setTime(60);
    }
    setTotp(location.state?.totp || false);
    setMobile(location.state?.mobile || '');
    setHistoryId(location.state?.historyid || '');
  }, [navigate, location.state]);

  // 更新计时器
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

  // 输入短信验证码
  const onCodeChange = e => {
    const v = e.target.value;

    if (/^[0-9]{0,6}$/.test(v)) {
      setCode(v);
    }
  }

  // 输入框按下回车提交
  const onCodeKeyDown = e => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  }

  // 信任设备
  const onTrustCheck = e => {
    setTrust(e.target.checked);
  }

  // 提交认证
  const onSubmit = async () => {
    if (code.length !== 6) {
      return enqueueSnackbar('请输入完整的短信验证码', {
        variant: 'warning', preventDuplicate: true,
      });
    }
    try {
      setLoading(true);

      const resp = await put('/signin/sms/verify', new URLSearchParams({
        smsid, code, historyid: historyId, trust,
      }));
      if (!resp?.token) {
        return enqueueSnackbar('服务器响应数据不完整', { variant: 'error' });
      }
      // 保存新的 token, 更新用户信息
      localStorage.setItem('token', resp.token);
      setUser({ ...user, activate: true });

      // 跳转到最近访问页面
      setLoading(false);
      navigate(getLastAccess());
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 重新发送验证码
  const onReSendClick = async () => {
    try {
      const resp = await post('/signin/sms/resend');
      if (!resp.smsid) {
        throw new Error('响应数据无效');
      }
      setSmsid(resp.smsid);
      setTime(60);
    } catch (err) {
      enqueueSnackbar(err.message)
    }
  }

  // 切换到 TOTP 认证
  const onSwitchOTP = () => {
    navigate('../otp', {
      state: {
        tfa: true, mobile, smsid, historyid: historyId,
      }
    });
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
          <Typography as='h1' variant="h6">短信认证</Typography>
          {smsid ?
            <Typography as='p' variant='caption' sx={{ mt: 1 }}>
              短信验证码已发送到手机号 ****{mobile?.substring(7)}，
              请输入短信中的验证码完成验证
            </Typography>
            :
            <Typography as='p' variant='caption' sx={{ mt: 1 }}>
              短信验证码将发送到手机号 ****{mobile?.substring(7)}，请获取短信验证码
            </Typography>
          }
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
                  <Button disabled={time > 0} onClick={onReSendClick}>
                    {time > 0 ? `${time} 秒` : '获取验证码'}
                  </Button>
                </InputAdornment>
                )
              }}
            />
            {time > 0 ?
              <FormHelperText sx={{ mx: 0, my: 1 }}>
                没有收到验证码？请等待 {time} 秒后尝试重新获取，如尝试多次无效，
                请联系技术支持协助处理。
                {totp &&
                  <Link underline="hover" onClick={onSwitchOTP}
                    sx={{ cursor: 'pointer' }}>
                    或切换到动态密码认证
                  </Link>
                }
              </FormHelperText>
              :
              <FormHelperText sx={{ mx: 0, my: 1 }}>
                没有收到验证码？请尝试重新获取，如尝试多次无效，请联系管理员协助处理。
                {totp &&
                  <Link underline="hover" onClick={onSwitchOTP}
                    sx={{ cursor: 'pointer' }}>
                    或切换到动态密码认证
                  </Link>
                }
              </FormHelperText>
            }
          </FormControl>
          <FormControlLabel sx={{ mt: 2 }}
            control={
              <Checkbox checked={trust} onChange={onTrustCheck}
                inputProps={{ 'aria-label': '信任当前设备' }}
              />
            }
            label={
              <Stack>
                <Typography as='span'>信任当前设备</Typography>
                <Typography variant='caption'>下次在该设备登录时无需再次验证</Typography>
              </Stack>
            }
          />
          <Button fullWidth variant="contained" size="large" sx={{ mt: 4 }}
            onClick={onSubmit} disabled={loading}>
            验证
          </Button>
        </Paper>
      </Container>
    </Stack>
  )
}
