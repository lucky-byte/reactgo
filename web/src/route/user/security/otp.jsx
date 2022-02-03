import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from "recoil";
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import KeyIcon from '@mui/icons-material/Key';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import { useHotkeys } from 'react-hotkeys-hook';
import QRCode from 'qrcode.react';
import { useSnackbar } from 'notistack';
import titleState from "~/state/title";
import userState from "~/state/user";
import { get, post } from '~/rest';

export default function OTP() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [user, setUser] = useRecoilState(userState);
  const [code, setCode] = useState('');
  const [url, setURL] = useState('');
  const [secret, setSecret] = useState('');

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useEffect(() => { setTitle('两因素认证'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/user/otp/url');
        if (!resp?.url || !resp?.secret) {
          throw new Error('响应数据无效');
        }
        setURL(resp.url);
        setSecret(resp.secret);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  // 回车
  const onCodeKeyDown = e => {
    if (e.key === 'Enter') {
      onVerify();
    }
  }

  // 验证
  const onVerify = async () => {
    try {
      if (code.length !== 6) {
        return enqueueSnackbar('请输入6位数字口令', { variant: 'warning' });
      }
      await post('/user/otp/verify', new URLSearchParams({ code, secret }));
      enqueueSnackbar('设置成功', { variant: 'success' });
      setUser({ ...user, totp_isset: true });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='flex-start' spacing={1}>
          <IconButton component={RouteLink} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack>
            <Typography variant='h6'>设置两因素认证</Typography>
            <Typography variant='caption'>
              两因素认证使用存储在您手机 APP 中的一次性口令作为第二个认证因素，
              可以增强您的账户安全性。
            </Typography>
            <Typography variant='caption'>
              您需要在手机中安装 TOTP 客户端来完成以下操作，不能卸载，
              否则无法找回口令。常见的 TOTP 客户端有:
              <br />
              <strong>Google Authenticator</strong>、
              <strong>Microsoft Authenticator</strong>、
              <strong>RedHat FreeOTP</strong>
            </Typography>
          </Stack>
        </Stack>
        <Paper variant='outlined' sx={{ p: 3, mt: 4 }}>
          <Stack alignItems='center' spacing={2}>
            <TextField variant='filled' autoFocus
              hiddenLabel
              placeholder="6位口令，扫码获取"
              autoComplete='new-password'
              value={code} onChange={e => setCode(e.target.value)}
              onKeyDown={onCodeKeyDown}
              inputProps={{ maxLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <KeyIcon color='secondary' />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <Button onClick={onVerify}>验证</Button>
                  </InputAdornment>
                )
              }}
            />
            <Paper variant='outlined' sx={{ p: 2 }}>
              <Stack alignItems='center'>
                <QRCode value={url} size={256} renderAs='svg' fgColor='#044'
                  includeMargin
                />
                <FormHelperText>使用 APP 扫码获取 6 位数字口令</FormHelperText>
              </Stack>
            </Paper>
          </Stack>
        </Paper>
        <FormHelperText>
          TOTP 是 Time-based One-time Password Algorith（基于时间的一次性密码算法）
          的缩写，是国际标准，在&nbsp;
          <Link underline='hover'
            href='https://tools.ietf.org/html/rfc6238' target='_blank'>
            RFC 6238
          </Link>
          &nbsp;中定义。
        </FormHelperText>
      </Paper>
    </Container>
  )
}
