import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import useTitle from "~/hook/title";
import { put } from '~/lib/rest';

export default function Password() {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('修改登录密码');

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
      data.uuid = location.state?.uuid;

      data._audit = `修改用户 ${location.state?.name} 的密码`;

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
      <Paper sx={{ px: 5, py: 3, mt: 5 }}>
        <Typography variant='h5'>修改 {location.state?.name} 的登录密码</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper variant='outlined' sx={{ px: 4, py: 3, mt: 3 }}>
            <Stack spacing={4}>
              <TextField label='登录密码' variant='standard' fullWidth required
                type='password' autoComplete='new-password'
                placeholder='登录密码不能少于6个字符'
                InputProps={{
                  endAdornment:
                    <InputAdornment position="end">
                      <Button size='small' onClick={onNewPassword}>随机密码</Button>
                    </InputAdornment>
                }}
                InputLabelProps={{ shrink: true }}
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
              <TextField label='确认登录密码' variant='standard' fullWidth required
                type='password' autoComplete='new-password'
                placeholder='再次输入登录密码'
                InputLabelProps={{ shrink: true }}
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
                <Checkbox edge='start' defaultChecked {...register('sendmail')} />
              } />
            </Stack>
          </Paper>
          <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 4 }}>
            <Button color='secondary' disabled={isSubmitting}
              onClick={() => { navigate('..') }}>
              取消
            </Button>
            <LoadingButton variant='contained' type='submit'
              loading={isSubmitting}>
              提交
            </LoadingButton>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
