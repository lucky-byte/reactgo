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
import DateTimePicker from '@mui/lab/DateTimePicker';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import MDEditor, { getAutoSaved, delAutoSaved } from '~/comp/mdeditor';
import useTitle from "~/hook/title";
import { post } from '~/rest';

const Markdown = lazy(() => import('~/comp/markdown'));

export default function Add() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [title, setTitle] = useState('');
  const [titleHelpText, setTitleHelpText] = useState('');
  const [content, setContent] = useState('');
  const [sendTime, setSendTime] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(0);

  useTitle('发布公告');
  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  // 编辑器自动保存唯一标识
  const editorId = 'system.bulletin';

  // 恢复编辑器自动保存数据
  useEffect(() => {
    const saved = getAutoSaved(editorId);
    if (saved) {
      setContent(saved);
    }
  }, []);

  // 修改标题
  const onTitleChange = e => {
    setTitle(e.target.value);
    setTitleHelpText('');
  }

  // 修改发布时间
  const onSendTimeChange = time => {
    setSendTime(time);
  }

  // 预览
  const onPreview = () => {
    if (!title) {
      setTitleHelpText('不能为空');
      return enqueueSnackbar('请输入公告标题', { variant: 'warning' });
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

  // 保存草稿
  const onSubmitDraft = async () => {
    setLoading(1);
    await submit(1);
  }

  // 发布
  const onSubmit = async () => {
    setLoading(2);
    await submit(2);
  }

  // 提交
  const submit = async status => {
    try {
      if (!title) {
        setTitleHelpText('不能为空');
        return enqueueSnackbar('请输入公告标题', { variant: 'warning' });
      }
      if (!content) {
        return enqueueSnackbar('请输入公告内容', { variant: 'warning' });
      }
      if (sendTime) {
        if (sendTime.isBefore(dayjs().add(3, 'minute'))) {
          return enqueueSnackbar('发布时间至少要在3分钟后', { variant: 'warning' });
        }
      }
      setSubmitting(true);

      await post('/system/bulletin/add', new URLSearchParams({
        status, title, content, send_time: sendTime ? sendTime.utc().format('') : '',
      }));

      // 清除自动保存数据
      delAutoSaved(editorId);

      enqueueSnackbar('提交成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setSubmitting(false);
      setLoading(0);
    }
  }

  const onCancel = () => {
    delAutoSaved(editorId);
    navigate('..');
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
              inputProps={{ maxLength: 256 }}
            />
            <MDEditor id='editor' value={content} onChange={setContent}
              placeholder='公告内容，支持 Markdown 语法'
              uniqueId={editorId}
            />
          <DateTimePicker
            label="发布时间"
            minDateTime={dayjs().add(3, 'minute')}
            maxDateTime={dayjs().add(7, 'day')}
            value={sendTime}
            onChange={onSendTimeChange}
            renderInput={props => (
              <TextField
                {...props}
                variant='standard'
                helperText='可以设置在未来一周内的某个时间发布，如果不设置则立即发布'
              />
            )}
          />
          </Stack>
        </Paper>
        <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 2 }}>
          <Button color='secondary' disabled={submitting} onClick={onCancel}>
            取消
          </Button>
          <Button color='success' disabled={submitting} onClick={onPreview}>
            预览
          </Button>
          <LoadingButton onClick={onSubmitDraft}
            disabled={submitting} loading={loading === 1}>
            保存草稿
          </LoadingButton>
          <LoadingButton variant='contained' onClick={onSubmit}
            disabled={submitting} loading={loading === 2}>
            发布
          </LoadingButton>
        </Stack>
      </Paper>
      <Dialog onClose={onPreviewClose} open={previewOpen} maxWidth='md' fullWidth>
        <DialogTitle>
          <Stack direction='row' alignItems='center' justifyContent='flex-end'>
            <IconButton aria-label="关闭" onClick={onPreviewClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
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
