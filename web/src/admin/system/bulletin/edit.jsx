import { useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink, useLocation } from 'react-router-dom';
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import MDEditor, { getAutoSaved, delAutoSaved } from '~/comp/mdeditor';
import useTitle from "~/hook/title";
import { post } from '~/lib/rest';

export default function Edit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [title, setTitle] = useState('');
  const [titleHelpText, setTitleHelpText] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isNotify, setIsNotify] = useState(true);
  const [sendTime, setSendTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(0);

  useTitle('发布公告');
  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  // 编辑器自动保存唯一标识
  const editorId = 'system.bulletin';

  useEffect(() => {
    const bulletin = location.state?.bulletin;

    // 如果是通过编辑进入，则使用编辑的数据
    if (bulletin) {
      setTitle(bulletin.title);
      setContent(bulletin.content);
      setIsPublic(bulletin.is_public);
      setIsNotify(bulletin.is_notify);

      const sendtime = dayjs(bulletin.send_time);
      if (sendtime.isAfter(dayjs())) {
        setSendTime(sendtime);
      }
    } else {
      // 恢复编辑器自动保存数据
      const saved = getAutoSaved(editorId);
      if (saved) {
        setContent(saved);
      }
    }
  }, [location.state?.bulletin]);

  // 修改标题
  const onTitleChange = e => {
    setTitle(e.target.value);
    setTitleHelpText('');
  }

  // 修改公开访问
  const onIsPublicCheck = e => {
    setIsPublic(e.target.checked);
  }

  // 修改通知用户
  const onIsNotifyCheck = e => {
    setIsNotify(e.target.checked);
  }

  // 修改发布时间
  const onSendTimeChange = time => {
    setSendTime(time);
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
        if (sendTime.isBefore(dayjs())) {
          return enqueueSnackbar('发布时间不能早于当前时间', { variant: 'warning' });
        }
      }
      setSubmitting(true);

      const uuid = location.state?.bulletin ? location.state.bulletin.uuid : '';
      const send_time = sendTime ? sendTime.utc().format('') : '';

      const _audit = status === 2 ? `发布公告 ${title}` : '';
      const _noop = status === 1;

      await post('/system/bulletin/edit', new URLSearchParams({
        uuid, status, title, content, send_time,
        is_public: isPublic, is_notify: isNotify, _audit, _noop,
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
              ampm={false}
              mask='____/__/__ __:__'
              inputFormat='YYYY/MM/DD HH:mm'
              clearable
              clearText='清除'
              renderInput={props => (
                <TextField
                  {...props}
                  helperText='可以设置在未来一周内的某个时间发布，如果不设置则立即发布'
                />
              )}
            />
            <FormGroup>
              <FormControlLabel
                label="公开访问，任何人都可以查看此公告"
                control={
                  <Checkbox checked={isPublic} onChange={onIsPublicCheck} />
                }
              />
              <FormControlLabel
                label="通知用户，将公告以通知形式发送给系统内所有用户"
                control={
                  <Checkbox checked={isNotify} onChange={onIsNotifyCheck} />
                }
              />
            </FormGroup>
          </Stack>
        </Paper>
        <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 2 }}>
          <Button color='secondary' disabled={submitting} onClick={onCancel}>
            取消
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
    </Container>
  )
}
