import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  Navigate, useLocation, useNavigate, Link as RouteLink
} from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import progressState from "~/state/progress";
import useTitle from "~/hook/title";
import { get, put } from "~/lib/rest";
import CronHelp from './cronhelp';

export default function Modify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [progress, setProgress] = useRecoilState(progressState);
  const [funcList, setFuncList] = useState([]);
  const [info, setInfo] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('修改定时任务');

  const { register, handleSubmit, watch, control, setValue, formState: {
    errors, isSubmitting
  } } = useForm({
    defaultValues: {
      type: 1, func: '',
    }
  });

  const type = watch('type', 1);
  const cron = watch('cron', '');

  const reset = useCallback(info => {
    setValue("name", info.name);
    setValue("summary", info.summary);
    setValue("cron", info.cron);
    setValue("type", info.type);
    if (info.type === 1) {
      setValue("func", info.path);
    } else {
      setValue("path", info.path);
    }
  }, [setValue]);

  useEffect(() => {
    (async () => {
      try {
        if (location.state) {
          setProgress(true);

          // 查询可用的函数
          const resp = await get('/system/task/funcs');
          setFuncList(resp.funcs || []);

          // 查询任务信息
          const params = new URLSearchParams({ uuid: location.state.uuid });
          const info = await get('/system/task/info?' + params.toString());
          setInfo(info);
          reset(info);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [location.state, enqueueSnackbar, setProgress, reset]);

  // 验证 cron 表达式
  const onTestCron = async () => {
    if (cron.length === 0) {
      return enqueueSnackbar('请先输入表达式', { variant: 'warning' });
    }
    try {
      const params = new URLSearchParams({ cron });
      await get('/system/task/testcron?' + params.toString());
      enqueueSnackbar('表达式有效', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 提交
  const onSubmit = async data => {
    try {
      setProgress(true);

      data.uuid = location.state.uuid;
      data._audit = `修改定时任务 ${data.name} 的配置信息`;

      await put('/system/task/info', new URLSearchParams(data));
      enqueueSnackbar('更新成功', { variant: 'success' });
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
    <Container as='main' maxWidth='md' sx={{ mb: 2 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton aria-label="返回" component={RouteLink} to='..'>
            <Tooltip arrow title='ESC' placement='top'>
              <ArrowBackIcon color='primary' />
            </Tooltip>
          </IconButton>
          <Typography variant='h6'>定时任务</Typography>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper variant='outlined' sx={{ px: 4, py: 3 }}>
            <Stack spacing={4}>
              <Stack direction='row' spacing={3}>
                <TextField label='任务名称' variant='standard' fullWidth
                  required autoFocus focused
                  disabled={progress}
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
                  focused required placeholder='CRON 表达式'
                  disabled={progress}
                  helperText={errors?.cron?.message}
                  error={errors?.cron}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Tooltip title='测试表达式是否有效'>
                          <Button onClick={onTestCron}>验证</Button>
                        </Tooltip>
                        <CronHelp />
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
                <Controller name="type" control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField label='任务类型' variant='standard' fullWidth
                      disabled={progress}
                      required focused select
                      helperText='函数指内置于系统的功能，命令指外部可执行文件'
                      value={value} onChange={onChange}>
                      <MenuItem value={1}>函数</MenuItem>
                      <MenuItem value={2}>命令</MenuItem>
                    </TextField>
                  )}
                />
                {parseInt(type) === 1 ?
                  <Controller name="func" control={control}
                    render={({ field: { onChange, value } }) => (
                      <TextField label='函数' variant='standard' fullWidth
                        disabled={progress} required focused select
                        helperText='请从列表中选择一项'
                        value={value} onChange={onChange}>
                        {funcList.map(item => (
                          <MenuItem key={item.path} value={item.path}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  :
                  <TextField label='命令' variant='standard' fullWidth required
                    focused placeholder='文件路径'
                    disabled={progress}
                    helperText='可以是相对路径或绝对路径'
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
                focused placeholder='任务描述，可以不填'
                disabled={progress}
                {...register('summary', {
                  maxLength: {
                    value: 256, message: '超出最大长度'
                  },
                })}
              />
            </Stack>
          </Paper>
          <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 2 }}>
            <Button color='secondary' disabled={isSubmitting}
              onClick={() => { navigate('..') }}>
              取消
            </Button>
            <Button disabled={isSubmitting} onClick={() => { reset(info) }}>
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
