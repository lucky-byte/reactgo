import { useState, useRef } from 'react';
import { useTheme } from "@mui/material/styles";
import { useRecoilState } from "recoil";
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Slider from "@mui/material/Slider";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import AvatarEditor from 'react-avatar-editor';
import { useSnackbar } from 'notistack';
import userState from "~/state/user";
import { put } from "~/lib/rest";

export default function AvatarPicker(props) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useRecoilState(userState);
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(100);
  const [rotate, setRotate] = useState(0);
  const [file, setFile] = useState('');
  const [submiting, setSubmiting] = useState(false);

  const editorColor = theme.palette.mode === 'light' ?  [0,0,0,0.6] : [255,255,255,0.6];

  const fileRef = useRef(null);
  const editorRef = useRef(null);

  // 选择图片文件
  const onAvatarFileChange = e => {
    if (e && e.target && e.target.files) {
      if (e.target.files?.length > 0) {
        setFile(e.target.files[0]);
      }
    }
    setOpen(true);
  }

  // 加载图片失败
  const onLoadFailure = () => {
    enqueueSnackbar('加载图片失败');
  }

  // 关闭对话框
  const onClose = () => {
    if (fileRef.current) {
      fileRef.current.value = '';
    }
    setFile('');
    setScale(100);
    setRotate(0);
    setSubmiting(false);
    setOpen(false);
  };

  // 设置头像
  const onSetButtonClick = () => {
    if (editorRef.current) {
      const upload = async blob => {
        try {
          setSubmiting(true);

          if (blob && user) {
            const form = new FormData();

            form.append('avatar', blob, 'avatar.png');

            const resp = await put('/user/avatar', form);

            // 更新本地缓存, 加一个随机数来强制刷新
            const image = `${resp}&rand=${Math.random()}`;
            setUser({ ...user, avatar: image });
            enqueueSnackbar('更新成功', { variant: 'success' });
          }
          onClose();
        } catch (err) {
          enqueueSnackbar(err.message);
        } finally {
          setSubmiting(false);
        }
      }
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob(upload, 'image/png');
    }
  }

  return (
    <>
      <input id='avatarImage' hidden type="file" accept='image/*'
        ref={fileRef} onChange={onAvatarFileChange}
      />
      <Button size='small' component='label' htmlFor='avatarImage'>
        修改头像
      </Button>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
        <DialogTitle>修改头像</DialogTitle>
        <DialogContent>
          <Paper variant='outlined' sx={{ p: 2, mb: 1 }}>
          <Stack alignItems='center'>
            <AvatarEditor ref={editorRef}
              image={file}
              width={240}
              height={240}
              border={0}
              borderRadius={120}
              color={editorColor}
              scale={scale / 100}
              rotate={rotate}
              onLoadFailure={onLoadFailure}
            />
          </Stack>
          </Paper>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Typography noWrap variant='body2'>缩放:</Typography>
            <Slider aria-label="缩放" sx={{ flex: 1 }}
              size='small' min={20} max={400} valueLabelDisplay="auto"
              value={scale} onChange={(e, v) => setScale(v)}
            />
          </Stack>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Typography noWrap variant='body2'>旋转:</Typography>
            <Slider aria-label="旋转" sx={{ flex: 1 }}
              size='small' min={0} max={360} valueLabelDisplay="auto"
              value={rotate} onChange={(e, v) => setRotate(v)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color='secondary' onClick={onClose}>取消</Button>
          <LoadingButton variant='contained' loading={submiting}
            onClick={onSetButtonClick}>
            确定
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}
