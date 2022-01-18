import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { post } from '../../../rest';

export default function DevelopAdd() {
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const { enqueueSnackbar } = useSnackbar();

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('添加渠道开发商'); }, [setTitle]);

  const {
    register, handleSubmit, formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async data => {
    try {
      await post('/develop/bank/add', new URLSearchParams(data));
      enqueueSnackbar(`${data.name} 已添加成功`, { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 5, py: 3, mt: 5 }}>
        <Typography variant='h6' sx={{ pb: 3 }}>渠道开发商资料</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <Stack direction='row' spacing={3}>
              <TextField label='姓名' variant='standard' fullWidth
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
              <TextField label='手机号' variant='standard' fullWidth
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
            <TextField label='邮箱地址' variant='standard' fullWidth
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
            <TextField label='公司名称' variant='standard' fullWidth
              placeholder='公司名称，如果没有可以不填'
              {...register('company', {
                maxLength: {
                  value: 128, message: '超出最大长度'
                },
              })}
            />
            <TextField label='联系地址' variant='standard' fullWidth
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
              <Button type='reset' disabled={isSubmitting}>重置</Button>
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
