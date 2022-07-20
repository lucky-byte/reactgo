import { useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isIdentityCard from 'validator/lib/isIdentityCard'
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import { get, post } from '~/lib/rest';

export default function Add() {
  const navigate = useNavigate();
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [ acls, setAcls ] = useState([]);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('添加用户');
  useSetCode(9000);

  const {
    register, handleSubmit, setValue, formState: {
      errors, isSubmitting
    }
  } = useForm();

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);
        const resp = await get('/system/acl/');
        setAcls(resp.acls || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

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
      data._audit = `新增用户 ${data.name}`;

      await post('/system/user/add', new URLSearchParams(data));
      enqueueSnackbar(`用户 ${data.name} 添加成功`, { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper sx={{ px: 4, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton aria-label='返回' component={RouteLink} to='..'>
            <Tooltip arrow title='ESC' placement='top'>
              <ArrowBackIcon color='primary' />
            </Tooltip>
          </IconButton>
          <Typography variant='h5'>用户资料</Typography>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper variant='outlined' sx={{ px: 4, py: 3 }}>
            <Stack spacing={4}>
              <Stack direction='row' spacing={3}>
                <TextField label='登录名' variant='standard' fullWidth required
                  autoFocus
                  placeholder='系统登录名'
                  disabled={isSubmitting}
                  helperText={errors?.userid?.message}
                  error={errors?.userid ? true : false}
                  inputProps={{ maxLength: 32 }}
                  {...register('userid', {
                    required: "不能为空",
                    maxLength: {
                      value: 32, message: '超出最大长度'
                    },
                  })}
                />
                <TextField label='姓名' variant='standard' fullWidth required
                  placeholder='用户真实姓名'
                  disabled={isSubmitting}
                  helperText={errors?.name?.message}
                  error={errors?.name ? true : false}
                  inputProps={{ maxLength: 64 }}
                  {...register('name', {
                    required: "不能为空",
                    maxLength: {
                      value: 64, message: '超出最大长度'
                    },
                  })}
                />
              </Stack>
              <Stack direction='row' spacing={3}>
                <TextField label='手机号' variant='standard' fullWidth
                  required type='tel'
                  placeholder='登录时用于接收短信验证码'
                  disabled={isSubmitting}
                  helperText={errors?.mobile?.message}
                  error={errors?.mobile ? true : false}
                  inputProps={{ maxLength: 11 }}
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
                <TextField label='邮箱地址' variant='standard' fullWidth
                  required type='email'
                  placeholder='用于接收重要邮件，请填写真实有效的邮箱地址'
                  disabled={isSubmitting}
                  helperText={errors?.email?.message}
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
              <Stack direction='row' spacing={3}>
                <TextField label='登录密码' variant='standard' fullWidth required
                  type='password' autoComplete='new-password'
                  placeholder='登录密码不能少于6个字符'
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment:
                      <InputAdornment position="end">
                        <Button size='small' onClick={onNewPassword}>随机密码</Button>
                      </InputAdornment>
                  }}
                  InputLabelProps={{ shrink: true }}
                  helperText={errors?.password?.message}
                  error={errors?.password ? true : false}
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
                  disabled={isSubmitting}
                  InputLabelProps={{ shrink: true }}
                  helperText={errors?.password2?.message}
                  error={errors?.password2 ? true : false}
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
              </Stack>
              <TextField label='身份证号码' variant='standard' fullWidth
                placeholder='18位居民身份证号码'
                disabled={isSubmitting}
                helperText={errors?.idno?.message}
                error={errors?.idno ? true : false}
                inputProps={{ maxLength: 18 }}
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
              <Stack>
                <TextField id='acl' label='访问控制' variant='standard' fullWidth
                  required select defaultValue=''
                  disabled={isSubmitting}
                  helperText={errors?.acl?.message}
                  {...register('acl', { required: "不能为空" })}>
                  {acls.map(acl => (
                    <MenuItem key={acl.uuid} value={acl.uuid}>
                      <Stack direction='row' alignItems='center' sx={{ width: '100%' }}>
                        {acl.code === 0 ?
                          <Typography sx={{ flex: 1 }} color='secondary'>
                            {acl.name}
                          </Typography>
                          :
                          <Typography sx={{ flex: 1 }}>{acl.name}</Typography>
                        }
                        <Typography variant='caption' noWrap sx={{maxWidth: 500}}>{acl.summary}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
                <FormHelperText>请正确选择用户的访问控制角色，以免越权访问</FormHelperText>
              </Stack>
              <TextField label='联系地址' variant='standard' fullWidth
                placeholder='用户联系地址，如果没有可以不填'
                disabled={isSubmitting}
                {...register('address', {
                  maxLength: {
                    value: 256, message: '超出最大长度'
                  },
                })}
              />
              <Stack>
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
                    <Checkbox defaultChecked {...register('tfa')}
                      disabled={isSubmitting}
                    />
                  }
                />
                <FormControlLabel sx={{ mt: 2 }}
                  label={
                    <Stack spacing={0}>
                      <Typography>将登录信息发送到用户邮箱</Typography>
                      <FormHelperText sx={{ mt: 0 }}>
                        邮件中包含用户登录需要的所有信息(包括密码)，请确认录入的邮箱地址正确
                      </FormHelperText>
                    </Stack>
                  }
                  control={
                    <Checkbox defaultChecked {...register('sendmail')}
                      disabled={isSubmitting}
                    />
                  }
                />
              </Stack>
            </Stack>
          </Paper>
          <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 4 }}>
            <Button color='secondary' disabled={isSubmitting}
              onClick={() => { navigate('..') }}>
              取消
            </Button>
            <Button type='reset' disabled={isSubmitting}>重置</Button>
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
