import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import titleState from "../../../state/title";
import progressState from "../../../state/progress";
import { get, put } from '../../../rest';

export default function DevelopInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [info, setInfo] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('修改商户拓展商资料'); }, [setTitle]);

  const {
    register, handleSubmit, setValue, formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    (async () => {
      try {
        if (location.state) {
          setProgress(true);

          const params = new URLSearchParams({ uuid: location.state.uuid });
          const resp = await get('/develop/merch/info?' + params.toString());
          setInfo(resp);
          setValue("name", resp.name);
          setValue("mobile", resp.mobile);
          setValue("email", resp.email);
          setValue("address", resp.address);
          setValue("company", resp.company);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [location.state, enqueueSnackbar, setValue, setProgress]);

  const onReset = () => {
    setValue("name", info.name);
    setValue("mobile", info.mobile);
    setValue("email", info.email);
    setValue("address", info.address);
    setValue("company", info.company);
  }

  const onSubmit = async data => {
    try {
      data.uuid = location.state.uuid;
      await put('/develop/merch/info', new URLSearchParams(data));
      enqueueSnackbar('资料更新成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 5, py: 3, mt: 5 }}>
        <Typography variant='h6' sx={{ pb: 3 }}>商户拓展商资料</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <Stack direction='row' spacing={3}>
              <TextField label='姓名' variant='standard' fullWidth focused
                required
                placeholder='联系人真实姓名'
                helperText={errors?.name?.message}
                {...register('name', {
                  required: "不能为空",
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                })}
              />
              <TextField label='手机号' variant='standard' fullWidth focused
                required type='tel'
                placeholder='联系人手机号'
                inputProps={{ maxLength: 11 }}
                helperText={errors?.mobile?.message}
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
            </Stack>
            <TextField label='邮箱地址' variant='standard' fullWidth focused
              required type='email'
              placeholder='用于接收重要邮件，请填写真实有效的邮箱地址'
              helperText={errors?.email?.message}
              {...register('email', {
                required: "不能为空",
                maxLength: {
                  value: 128, message: '超出最大长度'
                },
              })}
            />
            <TextField label='公司名称' variant='standard' fullWidth focused
              placeholder='公司名称，如果没有可以不填'
              {...register('company', {
                maxLength: {
                  value: 128, message: '超出最大长度'
                },
              })}
            />
            <TextField label='联系地址' variant='standard' fullWidth focused
              maxLength={256}
              placeholder='联系地址，如果没有可以不填'
              {...register('address', {
                maxLength: {
                  value: 256, message: '超出最大长度'
                },
              })}
            />
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
    </Container>
  )
}
