import { useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import titleState from "~/state/title";
import progressState from '~/state/progress';
import { get, post } from '~/rest';

export default function TaskAdd() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const [funcs, setFuncs] = useState([]);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useEffect(() => { setTitle('添加定时任务'); }, [setTitle]);

  const {
    register, handleSubmit, watch, formState: {
      errors, isSubmitting
    }
  } = useForm();

  const type = watch('type', 1);
  const cron = watch('cron', '');

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);
        const resp = await get('/system/task/funcs');
        setFuncs(resp.funcs || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  const onTestCron = async () => {
    if (cron.length === 0) {
      return enqueueSnackbar('请输入 cron 表达式', { variant: 'warning' });
    }
    try {
      const params = new URLSearchParams({ cron });
      await get('/system/task/testcron?' + params.toString());
      enqueueSnackbar('表达式有效', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onSubmit = async data => {
    try {
      await post('/system/task/add', new URLSearchParams(data));
      enqueueSnackbar('添加成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton component={RouteLink} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack>
            <Typography variant='h6'>定时任务</Typography>
            <FormHelperText>
              配置定时任务需要对系统内部有比较深入的了解，请在开发人员的指导下进行配置
            </FormHelperText>
          </Stack>
        </Stack>
        <Paper variant='outlined' sx={{ px: 4, py: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <Stack direction='row' spacing={3}>
                <TextField label='任务名称' variant='standard' fullWidth
                  required autoFocus
                  placeholder='定时任务名称'
                  helperText={errors?.name?.message}
                  error={errors?.name}
                  {...register('name', {
                    required: "不能为空",
                    maxLength: {
                      value: 32, message: '超出最大长度'
                    },
                  })}
                />
                <TextField label='调度表达式' variant='standard' fullWidth
                  required placeholder='CRON 表达式'
                  helperText={errors?.cron?.message}
                  error={errors?.cron}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Tooltip title='测试表达式是否有效'>
                          <Button onClick={onTestCron}>测试</Button>
                        </Tooltip>
                        <Tooltip title='查看帮助'>
                          <IconButton LinkComponent={RouteLink} to='../cron'>
                            <HelpOutlineIcon fontSize='small' color='primary' />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                  {...register('cron', {
                    required: "不能为空",
                    maxLength: {
                      value: 64, message: '超出最大长度'
                    },
                  })}
                />
              </Stack>
              <Stack direction='row' spacing={3}>
                <TextField label='任务类型' variant='standard' fullWidth
                  required select defaultValue={1}
                  helperText={errors?.type?.message}
                  error={errors?.type}
                  {...register('type', { required: "不能为空" })}
                >
                  <MenuItem value={1}>内置函数</MenuItem>
                  <MenuItem value={2}>外部命令</MenuItem>
                </TextField>
                {parseInt(type) === 1 ?
                  <TextField label='函数名' variant='standard' fullWidth
                    required select defaultValue=''
                    helperText={errors?.func?.message}
                    error={errors?.func}
                    {...register('func', { required: "不能为空" })}
                  >
                    {funcs.map(item => (
                      <MenuItem key={item.name} value={item.name}>
                        {item.title}
                      </MenuItem>
                    ))}
                  </TextField>
                  :
                  <TextField label='文件路径' variant='standard' fullWidth required
                    placeholder='文件路径'
                    helperText={errors?.path?.message}
                    error={errors?.path}
                    {...register('path', {
                      required: "不能为空",
                      maxLength: {
                        value: 128, message: '超出最大长度'
                      },
                    })}
                  />
                }
              </Stack>
              <TextField label='描述' variant='standard' fullWidth
                placeholder='任务描述，可以不填'
                {...register('summary', {
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
      </Paper>
    </Container>
  )
}
