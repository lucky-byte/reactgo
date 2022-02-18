import { useState, useEffect, useCallback } from 'react';
import { useRecoilState } from "recoil";
import { useNavigate, useLocation, Link as RouteLink } from 'react-router-dom';
import { useForm, Controller } from "react-hook-form";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import Button from "@mui/material/Button";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import progressState from "~/state/progress";
import { get, put } from '~/rest';

export default function Modify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [progress, setProgress] = useRecoilState(progressState);
  const [ passwordVisible, setPasswordVisible ] = useState(false);
  const [mta, setMta] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  const {
    register, handleSubmit, setValue, control, formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      sslmode: 'true',
    }
  });

  const reset = useCallback(info => {
    setValue("name", info.name);
    setValue("host", info.host);
    setValue("port", info.port);
    setValue("sslmode", info.sslmode ? 'true' : 'false');
    setValue("sender", info.sender);
    setValue("username", info.username);
    setValue("password", info.passwd);
    setValue("replyto", info.replyto);
    setValue("prefix", info.prefix);
    setValue("cc", info.cc);
    setValue("bcc", info.bcc);
  }, [setValue]);

  useEffect(() => {
    (async () => {
      try {
        if (location.state) {
          setProgress(true);

          const params = new URLSearchParams({ uuid: location.state.uuid });
          const resp = await get('/system/settings/mail/info?' + params.toString());
          setMta(resp);
          reset(resp);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [location.state, enqueueSnackbar, setProgress, reset]);

  const onReset = () => {
    reset(mta);
  }

  const onSubmit = async data => {
    try {
      setProgress(true);

      data.uuid = location?.state?.uuid;
      await put('/system/settings/mail/modify', new URLSearchParams(data));
      enqueueSnackbar('更新成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setProgress(false);
    }
  }

  return (
    <Stack sx={{ mt: 4 }}>
      <Stack direction='row' alignItems='center' spacing={1}>
        <IconButton component={RouteLink} to='..'>
          <ArrowBackIcon color='primary' />
        </IconButton>
        <Typography variant='h6'>修改邮件传输代理</Typography>
      </Stack>
      <Paper variant='outlined' sx={{ px: 5, py: 3, mt: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <TextField label='名称' variant='standard' fullWidth
              required focused autoComplete='off'
              placeholder='自定义，一般是邮件服务器的称呼，例如 QQ 邮箱'
              disabled={progress}
              helperText={errors?.name?.message}
              error={errors?.name}
              {...register('name', {
                required: "不能为空",
                maxLength: {
                  value: 32, message: '超出最大长度'
                },
              })}
            />
            <Stack direction='row' spacing={3}>
              <TextField label='服务器地址' variant='standard' required
                focused autoComplete='url'
                disabled={progress}
                placeholder='邮件服务器域名，例如 smtp.qq.com'
                helperText={errors?.host?.message}
                error={errors?.host}
                sx={{ flex: 2 }}
                {...register('host', {
                  required: "不能为空",
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                })}
              />
              <TextField label='端口' variant='standard' required
                focused autoComplete='off'
                disabled={progress}
                placeholder='邮件服务器端口'
                inputProps={{ maxLength: 5 }}
                helperText={errors?.port?.message}
                error={errors?.port}
                sx={{ flex: 1 }}
                {...register('port', {
                  required: "不能为空",
                  maxLength: {
                    value: 5, message: '长度不能超出5位'
                  },
                  pattern: {
                    value: /^[0-9]{1,5}$/, message: '格式不符合规范'
                  },
                })}
              />
              <Controller name="sslmode" control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField label='加密模式' variant='standard' required
                    disabled={progress}
                    select value={value} onChange={onChange}
                    sx={{ flex: 1 }}>
                    <MenuItem value='true'>SSL</MenuItem>
                    <MenuItem value='false'>StartTLS</MenuItem>
                  </TextField>
                )}
              />
            </Stack>
            <Stack>
              <TextField label='发件人地址' variant='standard' fullWidth required
                focused autoComplete='email'
                disabled={progress}
                placeholder='发件人邮箱地址，通常也是登录账号'
                helperText={errors?.sender?.message}
                error={errors.sender}
                {...register('sender', {
                  required: "不能为空",
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                })}
              />
              <FormHelperText>
                可以是简单的邮箱地址，例如 zs@mail.com，也可以是带有名称的格式，
                例如 zhangsan &lt;zs@mail.com&gt;
              </FormHelperText>
            </Stack>
            <Stack direction='row' spacing={3}>
              <TextField label='登录用户' variant='standard' fullWidth
                focused autoComplete='off'
                disabled={progress}
                placeholder='通常使用发件人地址作为登录用户，此字段不填'
                helperText={errors?.username?.message}
                error={errors?.username}
                {...register('username', {
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                })}
              />
              <TextField label='登录密码' variant='standard' fullWidth
                focused autoComplete='new-password'
                disabled={progress}
                type={passwordVisible ? 'text' : 'password'}
                placeholder='服务器登录密码，如果没有则不填'
                InputProps={{
                  endAdornment:
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setPasswordVisible(!passwordVisible)}>
                        {passwordVisible ?
                          <VisibilityOffIcon />
                          :
                          <VisibilityIcon />
                        }
                      </IconButton>
                    </InputAdornment>
                }}
                helperText={errors?.password?.message}
                error={errors?.password}
                {...register('password', {
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                })}
              />
            </Stack>
            <Stack>
              <TextField label='标题前缀' variant='standard' fullWidth
                focused autoComplete='off'
                disabled={progress}
                placeholder='邮件标题前缀，可以不填'
                helperText={errors?.prefix?.message}
                error={errors?.prefix}
                {...register('prefix', {
                  maxLength: {
                    value: 32, message: '超出最大长度'
                  },
                })}
              />
              <FormHelperText>
                标题前缀自动添加到每封邮件的标题之前，通常是公司或产品的名称，
                例如 [XX公司]、[XX产品]，可以为空。
              </FormHelperText>
            </Stack>
            <Stack>
              <TextField label='回复地址' variant='standard' fullWidth
                focused autoComplete='email'
                disabled={progress}
                placeholder='邮件回复地址，可以不填'
                helperText={errors?.replyto?.message}
                error={errors?.replyto}
                {...register('replyto', {
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                })}
              />
              <FormHelperText>
                可以是简单的邮箱地址，例如 zs@mail.com，也可以是带有名称的格式，
                例如 zhangsan &lt;zs@mail.com&gt;
              </FormHelperText>
            </Stack>
            <Stack>
              <TextField label='抄送地址' variant='standard' fullWidth focused
                disabled={progress}
                placeholder='邮件抄送地址，可以不填，多个地址以逗号分隔'
                helperText={errors?.cc?.message}
                error={errors?.cc}
                {...register('cc', {
                  maxLength: {
                    value: 256, message: '超出最大长度'
                  },
                })}
              />
              <FormHelperText>
                系统发出的每封邮件都会抄送到这里配置的地址，多个地址以逗号(,)分割。
              </FormHelperText>
            </Stack>
            <Stack>
              <TextField label='密送地址' variant='standard' fullWidth focused
                disabled={progress}
                placeholder='邮件密送地址，可以不填，多个地址以逗号分隔'
                helperText={errors?.bcc?.message}
                error={errors?.bcc}
                {...register('bcc', {
                  maxLength: {
                    value: 256, message: '超出最大长度'
                  },
                })}
              />
              <FormHelperText>
                系统发出的每封邮件都会密送到这里配置的地址，多个地址以逗号(,)分割。
              </FormHelperText>
            </Stack>
            <Stack direction='row' spacing={2} justifyContent='flex-end'>
              <Button color='secondary' disabled={isSubmitting}
                onClick={() => { navigate('..') }}>
                取消
              </Button>
              <Button disabled={isSubmitting} onClick={onReset}>重置</Button>
              <LoadingButton variant='contained' type='submit'
                loading={isSubmitting}>
                提交
              </LoadingButton>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
