import { useNavigate } from 'react-router-dom';
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
import useTitle from "~/hook/title";
import { post } from '~/lib/rest';

export default function Add() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('添加角色');

  const { register, handleSubmit, formState: {
    errors, isSubmitting
  } } = useForm();

  const onSubmit = async data => {
    try {
      data._audit = `添加访问控制角色 ${data.name}`;

      await post('/system/acl/add', new URLSearchParams(data));
      enqueueSnackbar(`${data.name} 已添加成功`, { variant: 'success' });
      localStorage.removeItem('last-acl-uuid');
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' maxWidth='sm' sx={{ mb: 2 }}>
      <Paper elevation={3} sx={{ px: 5, py: 3, mt: 5 }}>
        <Typography variant='h6' sx={{ pb: 3 }}>角色信息</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <TextField label='角色名' variant='outlined' fullWidth
              required autoFocus
              placeholder='简单扼要的名称'
              helperText={errors?.name?.message}
              {...register('name', {
                required: "不能为空",
                maxLength: {
                  value: 32, message: '超出最大长度'
                },
              })}
            />
            <TextField label='说明' variant='outlined' fullWidth
              required multiline rows={3}
              placeholder='请说明使用场景'
              {...register('summary', {
                maxLength: {
                  value: 512, message: '超出最大长度'
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
