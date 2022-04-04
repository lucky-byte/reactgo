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
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import MDEditor from '~/comp/mdeditor';
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import { get, post } from '~/rest';

export default function Add() {
  const navigate = useNavigate();
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState('');

  useTitle('发布公告');
  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  const {
    register, handleSubmit, setValue, formState: {
      errors, isSubmitting
    }
  } = useForm();

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  const onSubmit = async () => {
    try {
      await post('/system/user/add', new URLSearchParams());
      // enqueueSnackbar(`用户 ${data.name} 添加成功`, { variant: 'success' });
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
          <Typography variant='h6'>发布公告</Typography>
        </Stack>
        <Paper variant='outlined' sx={{ px: 4, py: 3 }}>
          <Stack spacing={2}>
          <TextField label='标题' variant='outlined' fullWidth required autoFocus
            placeholder='公告标题'
            value={title}
            onChange={e => setTitle(e.target.value)}
            // helperText={errors?.userid?.message}
            // error={errors?.userid}
          />
          <MDEditor id='editor' value={content} onChange={setContent}
            placeholder='公告内容'
          />
          </Stack>
        </Paper>
          <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 2 }}>
            <Button color='secondary' disabled={isSubmitting}
              onClick={() => { navigate('..') }}>
              取消
            </Button>
            <Button variant='outlined' color='success' disabled={submitting}>
              预览
            </Button>
            <LoadingButton variant='contained' onClick={onSubmit}
              loading={submitting}>
              提交
            </LoadingButton>
          </Stack>
      </Paper>
    </Container>
  )
}
