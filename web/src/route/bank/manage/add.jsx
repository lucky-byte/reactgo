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

export default function BankAdd() {
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const { enqueueSnackbar } = useSnackbar();

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('添加渠道'); }, [setTitle]);

  const {
    register, handleSubmit, formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async data => {
    try {
      await post('/bank/manage/add', new URLSearchParams(data));
      enqueueSnackbar(`${data.name} 已添加成功`, { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 5, py: 3, mt: 5 }}>
        <Typography variant='h6' sx={{ pb: 3 }}>渠道资料</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <Stack direction='row' spacing={3}>
              <TextField label='渠道代码' variant='standard' sx={{ width: '25%' }}
                required
                placeholder='渠道代码'
                helperText={errors?.code?.message}
                inputProps={{ maxLength: 32 }}
                {...register('code', {
                  required: "不能为空",
                  maxLength: {
                    value: 32, message: '超出最大长度'
                  },
                  pattern: {
                    value: /^[0-9]+$/, message: '格式不符合规范'
                  },
                })}
              />
              <TextField label='渠道简称' variant='standard' sx={{ width: '25%' }}
                required
                placeholder='不能超出6个字'
                helperText={errors?.name?.message}
                inputProps={{ maxLength: 6 }}
                {...register('name', {
                  required: "不能为空",
                  maxLength: {
                    value: 6, message: '超出最大长度'
                  },
                })}
              />
              <TextField label='渠道全称' variant='standard' sx={{ width: '50%' }}
                required
                placeholder='渠道简称，不要超出6个字'
                helperText={errors?.fullname?.message}
                {...register('fullname', {
                  required: "不能为空",
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                })}
              />
            </Stack>
            <TextField label='渠道开发商' variant='standard' fullWidth required select
              {...register('develop', {
                maxLength: {
                  value: 128, message: '超出最大长度'
                },
              })}
            />
            <Stack direction='row' spacing={3}>
              <TextField label='联系人' variant='standard' sx={{ width: '25%' }}
                placeholder='联系人姓名'
                helperText={errors?.contact?.message}
                {...register('contact', {
                  required: "不能为空",
                  maxLength: {
                    value: 16, message: '超出最大长度'
                  },
                })}
              />
              <TextField label='手机号' variant='standard' sx={{ width: '25%' }}
                type='tel'
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
              <TextField label='邮箱地址' variant='standard' sx={{ width: '50%' }}
                type='email'
                placeholder='联系人邮箱地址'
                helperText={errors?.email?.message}
                {...register('email', {
                  required: "不能为空",
                  maxLength: {
                    value: 128, message: '超出最大长度'
                  },
                })}
              />
            </Stack>
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
