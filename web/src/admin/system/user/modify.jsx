import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  Navigate, useLocation, useNavigate, Link as RouteLink
} from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isIdentityCard from 'validator/lib/isIdentityCard'
import progressState from "~/state/progress";
import useTitle from "~/hook/title";
import { get, put } from "~/lib/rest";

export default function Modify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [progress, setProgress] = useRecoilState(progressState);
  const [userInfo, setUserInfo] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('修改用户资料');

  const { register, handleSubmit, control, setValue, clearErrors, formState: {
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
    setValue("idno", info.idno);
    setValue("address", info.address);
    setValue("tfa", info.tfa);
    clearErrors();
  }, [setValue, clearErrors]);

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
      data._audit = `修改用户 ${data.name} 的资料`;

      await put('/system/user/modify', new URLSearchParams(data));
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
    <Container as='main' maxWidth='md' sx={{ mb: 6 }}>
      <Paper sx={{ px: 4, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton aria-label="返回" component={RouteLink} to='..'>
            <Tooltip arrow title='ESC' placement='top'>
              <ArrowBackIcon color='primary' />
            </Tooltip>
          </IconButton>
          <Typography variant='h5'>修改用户资料</Typography>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper variant='outlined' sx={{ px: 4, py: 3 }}>
            <Stack spacing={4}>
              <Stack direction='row' spacing={3}>
                <TextField label='登录名' variant='standard' fullWidth required
                  disabled={progress || isSubmitting}
                  placeholder='系统登录名'
                  helperText={errors?.userid?.message}
                  error={errors?.userid ? true : false}
                  inputProps={{ maxLength: 32 }}
                  InputLabelProps={{ shrink: true }}
                  {...register('userid', {
                    required: "不能为空",
                    maxLength: {
                      value: 32, message: '超出最大长度'
                    },
                  })}
                />
                <TextField label='真实姓名' variant='standard' fullWidth required
                  disabled={progress || isSubmitting}
                  placeholder='用户真实姓名'
                  helperText={errors?.name?.message}
                  error={errors?.name ? true : false}
                  inputProps={{ maxLength: 64 }}
                  InputLabelProps={{ shrink: true }}
                  {...register('name', {
                    required: "不能为空",
                    maxLength: {
                      value: 64, message: '超出最大长度'
                    },
                  })}
                />
              </Stack>
              <Stack direction='row' spacing={3}>
                <TextField label='手机号' variant='standard' fullWidth required
                  disabled={progress || isSubmitting}
                  placeholder='登录时用于接收短信验证码'
                  type='tel'
                  helperText={errors?.mobile?.message}
                  error={errors?.mobile ? true : false}
                  inputProps={{ maxLength: 11 }}
                  InputLabelProps={{ shrink: true }}
                  {...register('mobile', {
                    required: "不能为空",
                    minLength: {
                      value: 11, message: '长度不足11位'
                    },
                    maxLength: {
                      value: 11, message: '长度不能超出11位'
                    },
                    validate: v => isMobilePhone(v, 'zh-CN') || '格式错误',
                  })}
                />
                <TextField label='邮箱地址' variant='standard' fullWidth required
                  disabled={progress || isSubmitting}
                  placeholder='用于接收各种邮件'
                  type='email'
                  helperText={errors?.email?.message}
                  InputLabelProps={{ shrink: true }}
                  error={errors?.email ? true : false}
                  {...register('email', {
                    required: "不能为空",
                    maxLength: {
                      value: 128, message: '超出最大长度'
                    },
                    validate: v => isEmail(v) || '格式错误',
                  })}
                />
              </Stack>
              <TextField label='身份证号' variant='standard' fullWidth
                disabled={progress || isSubmitting}
                placeholder='18位居民身份证号码'
                helperText={errors?.idno?.message}
                error={errors?.idno ? true : false}
                inputProps={{ maxLength: 18 }}
                InputLabelProps={{ shrink: true }}
                {...register('idno', {
                  minLength: {
                    value: 18, message: '长度不足18位'
                  },
                  maxLength: {
                    value: 18, message: '超出最大长度'
                  },
                  validate: v => {
                    if (v) {
                      return isIdentityCard(v, 'zh-CN') || '格式错误';
                    }
                    return true;
                  }
                })}
              />
              <TextField label='联系地址' variant='standard' fullWidth
                disabled={progress || isSubmitting}
                placeholder='联系地址，如果没有可以不填'
                InputLabelProps={{ shrink: userInfo.address ? true : false }}
                {...register('address', {
                  maxLength: {
                    value: 256, message: '超出最大长度'
                  },
                })}
              />
              <FormControlLabel
                label={
                  <Stack spacing={0}>
                    <Typography>登录时须验证短信验证码</Typography>
                    <FormHelperText sx={{ mt: 0 }}>
                      建议开启以保护账户安全，开启前请先正确配置系统短信服务
                    </FormHelperText>
                  </Stack>
                }
                control={
                  <Controller
                    control={control}
                    name="tfa"
                    render={({ field: { value, onChange, ref } }) => (
                      <Checkbox edge='start' checked={value} onChange={onChange}
                        disabled={progress || isSubmitting} inputRef={ref}
                      />
                    )}
                  />
                }
              />
            </Stack>
          </Paper>
          <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 4 }}>
            <Button color='secondary' disabled={isSubmitting}
              onClick={() => { navigate('..') }}>
              取消
            </Button>
            <Button disabled={isSubmitting} onClick={() => { reset(userInfo) }}>
              重置
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
