import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Switch from '@mui/material/Switch';
import FormHelperText from "@mui/material/FormHelperText";
import Divider from "@mui/material/Divider";
import { useSnackbar } from 'notistack';
import useTitle from "~/hook/title";
import InplaceInput from '~/comp/inplace-input';
import { useIndexTab } from '../state';
import { get, put } from "~/rest";

export default function Account() {
  const { enqueueSnackbar } = useSnackbar();
  const [lookUserid, setLookUserid] = useState(false);
  const [resetPass, setResetPass] = useState(false);
  const [duration, setDuration] = useState(0);

  useTitle('账号设置');
  useIndexTab();

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/setting/account/');
        setLookUserid(resp.lookuserid);
        setResetPass(resp.resetpass);
        setDuration(resp.sessduration);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  // 允许用户找回登录名
  const onLookUseridCheck = async () => {
    try {
      await put('/system/setting/account/lookuserid', new URLSearchParams({
        lookuserid: !lookUserid,
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
      await put('/system/setting/account/resetpass', new URLSearchParams({
        resetpass: !resetPass
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
      await put('/system/setting/account/duration', new URLSearchParams({
        duration: v
      }));
      setDuration(v);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack sx={{ mt: 2 }}>
      <Stack direction='row' alignItems='center'>
        <Stack sx={{ flex: 1 }}>
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
      <Stack direction='row' alignItems='center'>
        <Stack sx={{ flex: 1 }}>
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
      <Divider sx={{ my: 2 }} />
      <Stack>
        <Stack direction='row' alignItems='center'>
          <Typography>登录会话持续时间(分钟):</Typography>
          <InplaceInput text={duration || ''} onConfirm={onChangeDuration}
            color='primary' sx={{ flex: 1, ml: 2 }}
          />
        </Stack>
        <FormHelperText>
          用户登录成功后会话保持时间，以分钟为单位。例如 1440 表示持续时间为 1 天
        </FormHelperText>
      </Stack>
    </Stack>
  )
}
