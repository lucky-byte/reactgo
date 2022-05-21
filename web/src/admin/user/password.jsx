import { useState } from 'react';
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSecretCode } from '~/comp/secretcode';
import SecretInput from '~/comp/secret-input';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import { put } from "~/lib/rest";

export default function Password() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const secretCode = useSecretCode();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [newPasswordHide, setNewPasswordHide] = useState(true);
  const [newPassword2Hide, setNewPassword2Hide] = useState(true);
  const [disabled, setDisabled] = useState(false);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('修改密码');
  useSetCode(0);

  const onChangeClick = async () => {
    if (!oldPassword || !newPassword) {
      return enqueueSnackbar('请输入密码', { variant: 'warning' });
    }
    if (newPassword !== newPassword2) {
      return enqueueSnackbar('2次输入的新密码不一致', { variant: 'warning' });
    }
    if (oldPassword === newPassword) {
      return enqueueSnackbar('新旧密码不能相同', { variant: 'warning' });
    }
    try {
      setDisabled(true);

      const token = await secretCode();

      await put('/user/passwd', new URLSearchParams({
        secretcode_token: token, oldPassword, newPassword
      }));
      enqueueSnackbar('修改成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    } finally {
      setDisabled(false);
    }
  }

  return (
    <Container as='main' maxWidth='xs' sx={{ mb: 4 }}>
      <Paper elevation={4} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack>
          <Typography variant='h6'>修改登录密码</Typography>
          <Typography variant='caption'>
            建议使用密码管理工具自动生成和保存密码，例如浏览器内置的密码管理器
          </Typography>
        </Stack>
        <SecretInput fullWidth margin='normal' autoComplete='current-password'
          label="原登录密码" variant="standard" autoFocus
          value={oldPassword}
          onChange={e => { setOldPassword(e.target.value); }}
        />
        <TextField fullWidth margin='normal' autoComplete='new-password'
          label="新登录密码" variant="standard"
          type={newPasswordHide ? 'password' : 'text'}
          value={newPassword}
          onChange={e => { setNewPassword(e.target.value); }}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <IconButton aria-label='显示密码' size='small' onClick={() => {
                  setNewPasswordHide(!newPasswordHide);
                }}>
                  {newPasswordHide ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>,
          }}
        />
        <TextField fullWidth margin='normal' autoComplete='new-password'
          label="确认新登录密码" variant="standard"
          type={newPassword2Hide ? 'password' : 'text'}
          value={newPassword2}
          onChange={e => { setNewPassword2(e.target.value); }}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <IconButton aria-label='显示密码' size='small' onClick={() => {
                  setNewPassword2Hide(!newPassword2Hide);
                }}>
                  {newPassword2Hide ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>,
          }}
        />
        <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 4 }}>
          <Button color='secondary' LinkComponent={RouteLink} to='..'>
            取消
          </Button>
          <Button variant="contained" disabled={disabled} onClick={onChangeClick}>
            修改
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
