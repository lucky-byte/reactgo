import { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  Navigate, useLocation, useNavigate, Link as RouteLink
} from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import titleState from "~/state/title";
import progressState from "~/state/progress";
import { get, put } from "~/rest";

export default function Modify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [progress, setProgress] = useRecoilState(progressState);
  const [userInfo, setUserInfo] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('修改用户资料'); }, [setTitle]);

  const { register, handleSubmit, control, setValue, formState: {
    errors, isSubmitting
  }} = useForm({
    defaultValues: {
      tfa: true,
    }
  });

  const reset = useCallback(info => {
    setValue("userid", info.userid);
    setValue("name", info.name);
    setValue("mobile", info.mobile);
    setValue("email", info.email);
    setValue("address", info.address);
    setValue("tfa", info.tfa);
  }, [setValue]);

  useEffect(() => {
    (async () => {
      try {
        if (location.state) {
          setProgress(true);

          const params = new URLSearchParams({ uuid: location.state.uuid });
          const resp = await get('/system/user/info?' + params.toString());
          setUserInfo(resp);
          reset(resp);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [location.state, enqueueSnackbar, setProgress, reset]);

  const onSubmit = async data => {
    try {
      setProgress(true);

      data.uuid = location.state.uuid;
      await put('/system/user/info', new URLSearchParams(data));
      enqueueSnackbar('用户资料更新成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setProgress(false);
    }
  }

  if (!location.state?.uuid) {
    return <Navigate to='..' />
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 2 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton aria-label="返回" component={RouteLink} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h6'>用户资料</Typography>
        </Stack>
        <Paper variant='outlined' sx={{ px: 4, py: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <Stack direction='row' spacing={3}>
                <TextField label='登录名' variant='standard' focused fullWidth
                  required
                  disabled={progress}
                  placeholder='用于登录，使用字母或数字'
                  helperText={errors?.userid?.message}
                  error={errors?.userid}
                  {...register('userid', {
                    required: "不能为空",
                    maxLength: {
                      value: 32, message: '超出最大长度'
                    },
                  })}
                />
                <TextField label='真实姓名' variant='standard' focused fullWidth
                  required
                  disabled={progress}
                  placeholder='用户真实姓名'
                  helperText={errors?.name?.message}
                  error={errors?.name}
                  {...register('name', {
                    required: "不能为空",
                    maxLength: {
                      value: 64, message: '超出最大长度'
                    },
                  })}
                />
              </Stack>
              <Stack direction='row' spacing={3}>
                <TextField label='手机号' variant='standard' focused fullWidth
                  required type='tel'
                  disabled={progress}
                  placeholder='登录时用于接收短信验证码'
                  inputProps={{ maxLength: 11 }}
                  helperText={errors?.mobile?.message}
                  error={errors?.mobile}
                  {...register('mobile', {
                    required: "不能为空",
                    minLength: {
                      value: 11, message: '长度不足11位'
                    },
                    maxLength: {
                      value: 11, message: '长度不能超出11位'
                    },
                    pattern: {
                      value: /^1[0-9]{10}$/, message: '格式不符合规范'
                    },
                  })}
                />
                <TextField label='邮箱地址' variant='standard' focused fullWidth
                  required type='email'
                  disabled={progress}
                  placeholder='用于接收各种邮件'
                  helperText={errors?.email?.message}
                  error={errors?.email}
                  {...register('email', {
                    required: "不能为空",
                    maxLength: {
                      value: 128, message: '超出最大长度'
                    },
                  })}
                />
              </Stack>
              <TextField label='联系地址' variant='standard' focused fullWidth
                disabled={progress}
                placeholder='联系地址，如果没有可以不填'
                {...register('address', {
                  maxLength: {
                    value: 256, message: '超出最大长度'
                  },
                })}
              />
              <FormControlLabel label="登录时必须验证短信验证码（非特殊情况必须开启）"
                control={
                  <Controller
                    control={control}
                    name="tfa"
                    render={({ field: { value, onChange, ref } }) => (
                      <Switch checked={value} onChange={onChange}
                        disabled={progress}
                        inputRef={ref}
                      />
                    )}
                  />
                }
              />
              <Stack direction='row' spacing={2} justifyContent='flex-end'>
                <Button color='secondary' disabled={isSubmitting}
                  onClick={() => { navigate('..') }}>
                  取消
                </Button>
                <Button disabled={isSubmitting} onClick={() => {reset(userInfo)}}>
                  重置
                </Button>
                <LoadingButton variant='contained' type='submit'
                  loading={isSubmitting}>
                  提交
                </LoadingButton>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Paper>
    </Container>
  )
}
