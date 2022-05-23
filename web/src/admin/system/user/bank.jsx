import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  Navigate, useLocation, useNavigate, Link as RouteLink
} from "react-router-dom";
import { useForm } from "react-hook-form";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import luhn from '~/lib/luhn';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isIdentityCard from 'validator/lib/isIdentityCard'
import progressState from "~/state/progress";
import useTitle from "~/hook/title";
import { useSecretCode } from '~/comp/secretcode';
import { get, put } from "~/lib/rest";

export default function Bank() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const secretCode = useSecretCode();
  const [progress, setProgress] = useRecoilState(progressState);
  const [userInfo, setUserInfo] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('修改银行账号');

  const { register, handleSubmit, setValue, clearErrors, formState: {
    errors, isSubmitting
  }} = useForm();

  const reset = useCallback(info => {
    setValue("name", info.acct_name || info.name);
    setValue("idno", info.acct_idno || info.idno);
    setValue("mobile", info.acct_mobile || info.mobile);
    setValue("no", info.acct_no);
    setValue("bank_name", info.acct_bank_name);
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
      const token = await secretCode();

      setProgress(true);

      data.uuid = location.state.uuid;
      data.secretcode_token = token;
      data._audit = `修改用户 ${location.state?.name} 的银行账号`;

      await put('/system/user/bank', new URLSearchParams(data));
      enqueueSnackbar('银行账号更新成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    } finally {
      setProgress(false);
    }
  }

  if (!location.state?.uuid) {
    return <Navigate to='..' />
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 2 }}>
      <Paper sx={{ px: 4, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton aria-label="返回" component={RouteLink} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h5'>修改用户 {location.state?.name} 的银行账号</Typography>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper variant='outlined' sx={{ px: 4, py: 3 }}>
            <Stack spacing={4}>
              <Stack direction='row' spacing={3}>
                <TextField label='开户人' variant='standard' fullWidth required
                  disabled={progress}
                  placeholder='账户所有者全称'
                  helperText={errors?.name?.message}
                  error={errors?.name}
                  inputProps={{ maxLength: 64 }}
                  InputLabelProps={{ shrink: true }}
                  {...register('name', {
                    required: "不能为空",
                    maxLength: {
                      value: 64, message: '超出最大长度'
                    },
                  })}
                />
                <TextField label='身份证号' variant='standard' fullWidth required
                  disabled={progress}
                  placeholder='账户所有者身份证号码'
                  helperText={errors?.idno?.message}
                  error={errors?.idno}
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
              </Stack>
              <Stack direction='row' spacing={3}>
                <TextField label='手机号' variant='standard' fullWidth required
                  disabled={progress}
                  placeholder='账户绑定手机号'
                  type='tel'
                  helperText={errors?.mobile?.message}
                  error={errors?.mobile}
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
                <TextField label='账号' variant='standard' fullWidth required
                  disabled={progress}
                  placeholder='银行账号'
                  type='tel'
                  helperText={errors?.no?.message}
                  InputLabelProps={{ shrink: true }}
                  error={errors?.no}
                  {...register('no', {
                    required: "不能为空",
                    maxLength: {
                      value: 40, message: '超出最大长度'
                    },
                    validate: v => luhn(v) || '不符合银行卡号规范',
                  })}
                />
              </Stack>
              <TextField label='开户银行全称' variant='standard' fullWidth required
                disabled={progress}
                placeholder='开户银行完整名称'
                helperText={errors?.bank_name?.message}
                error={errors?.bank_name}
                inputProps={{ maxLength: 256 }}
                InputLabelProps={{ shrink: true }}
                {...register('bank_name', {
                  maxLength: {
                    value: 256, message: '超出最大长度'
                  },
                })}
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
