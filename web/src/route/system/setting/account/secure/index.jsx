import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Switch from '@mui/material/Switch';
import FormHelperText from "@mui/material/FormHelperText";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Skeleton from '@mui/material/Skeleton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSnackbar } from 'notistack';
import { useSecretCode } from '~/comp/secretcode';
import InplaceInput from '~/comp/inplace-input';
import useTitle from "~/hook/title";
import { useIndexTab } from '../state';
import { get, put } from "~/rest";
import JWTSignKeyButton from "./jwtsignkey";

export default function Secure() {
  const { enqueueSnackbar } = useSnackbar();
  const secretCode = useSecretCode();
  const [lookUserid, setLookUserid] = useState(false);
  const [resetPass, setResetPass] = useState(false);
  const [duration, setDuration] = useState(0);
  const [jwtSignKey, setJWTSignKey] = useState(0);
  const [jwtSignKeyHide, setJWTSignKeyHide] = useState(true);

  useTitle('账号安全设置');
  useIndexTab();

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/setting/account/');
        setLookUserid(resp.lookuserid);
        setResetPass(resp.resetpass);
        setDuration(resp.sessduration);
        setJWTSignKey(resp.jwtsignkey);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  // 允许用户找回登录名
  const onLookUseridCheck = async () => {
    try {
      const _audit = `${lookUserid ? '禁止' : '允许'}用户找回登录名`;

      await put('/system/setting/account/lookuserid', new URLSearchParams({
        lookuserid: !lookUserid, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setLookUserid(!lookUserid);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 允许用户找回密码
  const onResetPassCheck = async () => {
    try {
      const _audit = `${resetPass ? '禁止' : '允许'}用户找回登录密码`;

      await put('/system/setting/account/resetpass', new URLSearchParams({
        resetpass: !resetPass, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setResetPass(!resetPass);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 修改会话持续时间
  const onChangeDuration = async v => {
    try {
      const _audit = `修改用户登录会话持续时间为 ${v}`;

      await put('/system/setting/account/duration', new URLSearchParams({
        duration: v, _audit,
      }));
      setDuration(v);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 显示或隐藏 jwt sign key
  const onJWTSignKeyShow = async () => {
    try {
      if (jwtSignKeyHide) {
        await secretCode();
      }
      setJWTSignKeyHide(!jwtSignKeyHide);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Stack sx={{ mt: 2, mb: 3 }}>
      <Typography variant="h6" paragraph>登录及会话</Typography>
      <Stack>
        <Stack direction='row' alignItems='center' spacing={2}>
          <Typography>登录会话持续时间(分钟):</Typography>
          <InplaceInput text={duration || ''} onConfirm={onChangeDuration}
            color='primary' sx={{ flex: 1 }}
          />
        </Stack>
        <FormHelperText>
          用户登录成功后会话保持时间，以分钟为单位，例如 1440 表示持续时间为 1 天。
          已登录用户不受影响
        </FormHelperText>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Stack>
          <Typography>允许用户找回登录名</Typography>
          <FormHelperText>
            登录名是用户登录系统的唯一凭证，如果用户忘记了登录名，可以打开此开关允许用户找回登录名
          </FormHelperText>
        </Stack>
        <Switch checked={lookUserid} onChange={onLookUseridCheck}
          inputProps={{ 'aria-label': '开关' }}
        />
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Stack>
          <Typography>允许用户找回登录密码</Typography>
          <FormHelperText>
            找回密码需要用户的手机号和邮箱地址正确，如果不允许，
            则需要管理员登录后台帮助用户重置密码
          </FormHelperText>
        </Stack>
        <Switch checked={resetPass} onChange={onResetPassCheck}
          inputProps={{ 'aria-label': '开关' }}
        />
      </Stack>
      <Typography variant="h6" paragraph sx={{ mt: 6 }}>签名密钥</Typography>
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Stack>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Typography>会话签名密钥:</Typography>
            <Typography color='secondary'>
              {jwtSignKeyHide ?
                <Skeleton animation="wave" sx={{ width: 300 }} /> : jwtSignKey
              }
            </Typography>
            <IconButton color="primary" onClick={onJWTSignKeyShow}>
              {jwtSignKeyHide ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </Stack>
          <FormHelperText>
            用户登录后签发的 Json Web Token 使用该密钥进行签名，恶意用户可以使用该密钥伪造登录会话凭证
          </FormHelperText>
        </Stack>
        <JWTSignKeyButton setJWTSignKey={setJWTSignKey} />
      </Stack>
    </Stack>
  )
}
