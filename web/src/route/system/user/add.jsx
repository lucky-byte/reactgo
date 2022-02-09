import { useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';
import { grey } from '@mui/material/colors';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import titleState from "~/state/title";
import progressState from '~/state/progress';
import { get, post } from '~/rest';

export default function Add() {
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [ acls, setAcls ] = useState([]);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('添加用户'); }, [setTitle]);

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
      await post('/system/user/add', new URLSearchParams(data));
      enqueueSnackbar(`用户 ${data.name} 添加成功`, { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton aria-label='返回' component={RouteLink} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h6'>用户资料</Typography>
        </Stack>
        <Paper variant='outlined' sx={{ px: 4, py: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <Stack direction='row' spacing={3}>
                <TextField label='登录名' variant='standard' fullWidth required
                  autoFocus
                  placeholder='系统登录名，可使用任何字符，建议使用字母和数字'
                  helperText={errors?.userid?.message}
                  error={errors?.userid}
                  {...register('userid', {
                    required: "不能为空",
                    maxLength: {
                      value: 32, message: '超出最大长度'
                    },
                  })}
                />
                <TextField label='真实姓名' variant='standard' fullWidth required
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
                <TextField label='手机号' variant='standard' fullWidth
                  required type='tel'
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
                <TextField label='邮箱地址' variant='standard' fullWidth
                  required type='email'
                  placeholder='用于接收重要邮件，请填写真实有效的邮箱地址'
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
              <Stack direction='row' spacing={3}>
                <TextField label='登录密码' variant='standard' fullWidth focused
                  required type='password' autoComplete='new-password'
                  placeholder='登录密码不能少于6个字符'
                  InputProps={{
                    endAdornment:
                      <InputAdornment position="end">
                        <Button size='small' onClick={onNewPassword}>随机密码</Button>
                      </InputAdornment>
                  }}
                  helperText={errors?.password?.message}
                  error={errors?.password}
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
                <TextField label='确认登录密码' variant='standard' fullWidth focused
                  required type='password' autoComplete='new-password'
                  placeholder='再次输入登录密码'
                  helperText={errors?.password2?.message}
                  error={errors?.password2}
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
              <Stack>
                <TextField id='acl' label='访问控制' variant='standard' fullWidth
                  required select defaultValue=''
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
                        <Tooltip title={acl.summary} placement="top-start">
                          <HelpOutlineIcon
                            fontSize='small' sx={{ ml: 2, color: grey[600] }}
                          />
                        </Tooltip>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
                <FormHelperText>
                  未找到符合条件的访问控制角色？
                  <Link component={RouteLink} to='/system/acl/add'>点击这里</Link>
                  添加一个
                </FormHelperText>
              </Stack>
              <TextField label='联系地址' variant='standard' fullWidth
                placeholder='联系地址，如果没有可以不填'
                {...register('address', {
                  maxLength: {
                    value: 256, message: '超出最大长度'
                  },
                })}
              />
              <Stack>
                <FormControlLabel
                  label="登录时必须验证短信验证码（需正确配置系统短信服务）"
                  control={
                    <Switch defaultChecked {...register('tfa')} />
                  }
                />
                <FormControlLabel sx={{ mt: 1 }}
                  label={
                    <Stack spacing={0}>
                      <Typography>将登录信息（网址、登录名及密码）发送到用户邮箱</Typography>
                      <FormHelperText sx={{ mt: 0, color: 'orangered' }}>
                        邮件中将包含所有登录需要的信息，请务必确认录入的邮箱地址正确，并属于该用户
                      </FormHelperText>
                    </Stack>
                  }
                  control={
                    <Switch defaultChecked {...register('sendmail')} />
                  }
                />
              </Stack>
              <Stack direction='row' spacing={2} justifyContent='flex-end'>
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
            </Stack>
          </form>
        </Paper>
      </Paper>
    </Container>
  )
}
