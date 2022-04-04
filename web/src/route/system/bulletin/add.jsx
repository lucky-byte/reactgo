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
import titleState from "~/state/title";
import progressState from '~/state/progress';
import { get, post } from '~/rest';
// import SimpleMDE from 'react-simplemde-editor';
// import "easymde/dist/easymde.min.css";

export default function Add() {
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [content, setContent] = useState('');

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('发布公告'); }, [setTitle]);

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
      <MDEditor id='editor2' value={content} onChange={setContent} />
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton aria-label='返回' component={RouteLink} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h6'>公告内容</Typography>
        </Stack>
        <Paper variant='outlined' sx={{ px: 4, py: 3 }}>
          <Stack spacing={2}>
          <TextField label='标题' variant='outlined' fullWidth required
            autoFocus
            placeholder='公告标题'
            helperText={errors?.userid?.message}
            error={errors?.userid}
          />
          <MDEditor id='editor' value={content} onChange={setContent} />
            {/* <SimpleMDE /> */}
          </Stack>
        </Paper>
      </Paper>
    </Container>
  )
}
