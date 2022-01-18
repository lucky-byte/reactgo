import { useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import titleState from "../../../state/title";
import { put } from '../../../rest';

export default function UserPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const { enqueueSnackbar } = useSnackbar();

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('修改登录密码'); }, [setTitle]);

  const { register, handleSubmit, setValue, formState: {
    errors, isSubmitting
  } } = useForm();

  const onNewPassword = () => {
    const str = Math.random().toString(36);
    const passwd = str.split('.')[1];
    setValue('password', passwd);
    setValue('password2', passwd);
  }

  const onSubmit = async data => {
    if (data.password !== data.password2) {
      return enqueueSnackbar('2次密码输入不一致');
    }
    try {
      data.uuid = location?.state?.uuid;
      await put('/system/user/passwd', new URLSearchParams(data));
      enqueueSnackbar('登录密码已修改成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  if (!location.state?.uuid) {
    return <Navigate to='..' />
  }

  return (
    <Container as='main' maxWidth='sm' sx={{ mb: 2 }}>
      <Paper elevation={3} sx={{ px: 5, py: 3, mt: 5 }}>
        <Typography variant='h6'>登录密码</Typography>
        <Typography variant='subtitle1' sx={{ mb: 3 }} color='secondary'>
          {location?.state?.name}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <TextField label='登录密码' variant='standard' focused fullWidth
              required type='password' autoComplete='new-password'
              placeholder='登录密码不能少于6个字符'
              InputProps={{
                endAdornment:
                  <InputAdornment position="end">
                    <Button size='small' onClick={onNewPassword}>随机密码</Button>
                  </InputAdornment>
              }}
              helperText={errors?.password?.message}
              {...register('password', {
                required: "不能为空",
                minLength: {
                  value: 6, message: '长度不足6位'
                },
                maxLength: {
                  value: 64, message: '超出最大长度'
                },
              })}
            />
            <TextField label='确认登录密码' variant='standard' focused fullWidth
              required type='password' autoComplete='new-password'
              placeholder='再次输入登录密码'
              helperText={errors?.password2?.message}
              {...register('password2', {
                required: "不能为空",
                minLength: {
                  value: 6, message: '长度不足6位'
                },
                maxLength: {
                  value: 64, message: '超出最大长度'
                },
              })}
            />
            <FormControlLabel label="将新密码发送到用户邮箱" control={
              <Switch defaultChecked {...register('sendmail')} />
            } />
            <Stack direction='row' spacing={2} justifyContent='flex-end'>
              <Button color='secondary' disabled={isSubmitting}
                onClick={() => { navigate('..') }}>
                取消
              </Button>
              <LoadingButton variant='contained' type='submit'
                loading={isSubmitting}>
                提交
              </LoadingButton>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
