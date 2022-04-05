import { lazy, useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import MDEditor from '~/comp/mdeditor';
import useTitle from "~/hook/title";
import { post } from '~/rest';

const Markdown = lazy(() => import('~/comp/markdown'));

export default function Add() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [title, setTitle] = useState('');
  const [titleHelpText, setTitleHelpText] = useState('');
  const [content, setContent] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState('');

  useTitle('发布公告');
  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  // 修改标题
  const onTitleChange = e => {
    setTitle(e.target.value);
    setTitleHelpText('');
  }

  // 预览
  const onPreview = () => {
    if (!title) {
      return setTitleHelpText('不能为空');
    }
    if (!content) {
      return enqueueSnackbar('请输入公告内容', { variant: 'warning' });
    }
    setPreviewOpen(true);
  }

  // 关闭预览
  const onPreviewClose = () => {
    setPreviewOpen(false);
  }

  // 提交
  const onSubmit = async () => {
    try {
      if (!title) {
        return setTitleHelpText('不能为空');
      }
      if (!content) {
        return enqueueSnackbar('请输入公告内容', { variant: 'warning' });
      }
      setSubmitting(true);

      await post('/system/bulletin/add', new URLSearchParams(
        title, content,
      ));
      enqueueSnackbar('提交成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setSubmitting(false);
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
            value={title} onChange={onTitleChange}
            helperText={titleHelpText}
            error={titleHelpText.length > 0}
          />
          <MDEditor id='editor' value={content} onChange={setContent}
            placeholder='公告内容'
          />
          </Stack>
        </Paper>
        <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 2 }}>
          <Button color='secondary' disabled={submitting} onClick={() => { navigate('..') }}>
            取消
          </Button>
          <Button variant='outlined' color='success' disabled={submitting} onClick={onPreview}>
            预览
          </Button>
          <LoadingButton variant='contained' onClick={onSubmit} loading={submitting}>
            发布
          </LoadingButton>
        </Stack>
      </Paper>
      <Dialog onClose={onPreviewClose} open={previewOpen} maxWidth='md' fullWidth>
        <DialogTitle>发布预览
          <IconButton aria-label="关闭" onClick={onPreviewClose} sx={{
            position: 'absolute', right: 8, top: 8, color: theme => theme.palette.grey[500],
          }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Typography variant='h4' textAlign='center' paragraph>{title}</Typography>
            <Markdown>{content}</Markdown>
          </Paper>
        </DialogContent>
      </Dialog>
    </Container>
  )
}
