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
import { put } from "~/login/fetch";

export default function SignInOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useRecoilState(userState);
  const { enqueueSnackbar } = useSnackbar();
  const [trust, setTrust] = useState(false);
  const [tfa, setTFA] = useState(false);
  const [mobile, setMobile] = useState('');
  const [smsid, setSmsid] = useState('');
  const [historyId, setHistoryId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useTitle('动态密码认证');

  // 获取页面传入的数据
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return navigate('/signin', { replace: true });
    }
    setTFA(location.state?.tfa || false);
    setMobile(location.state?.mobile || '');
    setSmsid(location.state?.smsid || '');
    setHistoryId(location.state?.historyid || '');
  }, [navigate, location?.state]);

  // 输入密码
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
      return enqueueSnackbar('请输入完整的口令', {
        variant: 'warning', preventDuplicate: true,
      });
    }
    try {
      setLoading(true);

      const resp = await put('/signin/otp/verify', new URLSearchParams({
        code, trust, historyid: historyId,
      }));
      if (!resp || !resp.token) {
        return enqueueSnackbar('响应数据不完整', { variant: 'error' });
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

  // 切换到短信认证
  const onSwitchSMS = async () => {
    navigate('../sms', {
      state: {
        totp: true, mobile, smsid, historyid: historyId,
      }
    });
  }

  return (
    <Stack as='main' role='main' sx={{ mb: 5 }}>
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
          <Typography as='h1' variant="h6">动态密码认证</Typography>
          <Typography variant='caption'>请输入 6 位 TOTP 数字口令完成认证</Typography>
          <FormControl fullWidth sx={{ mt: 3 }}>
            <TextField required autoFocus autoComplete="off"
              label='TOTP 口令' placeholder="请输入 6 位口令"
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
            <FormHelperText sx={{ mx: 0, my: 1 }}>
              您可以在手机 TOTP 客户端中查看认证口令，如无法访问，请联系技术支持协助处理。
              {tfa &&
                <Link underline="hover" onClick={onSwitchSMS}
                  sx={{ cursor: 'pointer' }}>
                  或切换到短信认证
                </Link>
              }
            </FormHelperText>
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
