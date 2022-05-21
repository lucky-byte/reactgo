import { useNavigate, Link } from "react-router-dom";
import { useRecoilState } from 'recoil';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormHelperText from "@mui/material/FormHelperText";
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Divider from '@mui/material/Divider';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import Push from 'push.js';
import userState from '~/state/user';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import { post } from '~/lib/rest';

export default function Setting() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useRecoilState(userState);

  useHotkeys('esc', () => { navigate(-1); }, { enableOnTags: ["INPUT"] });
  useTitle('通知设置');
  useSetCode(0);

  // 允许通知提醒
  const onNotiPopupCheck = async e => {
    try {
      const enable = e.target.checked;

      await post('/user/notification/setting/popup', new URLSearchParams({ enable }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setUser({ ...user, noti_popup: enable });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 允许浏览器通知
  const onNotiBrowserCheck = async e => {
    const enable = e.target.checked;

    if (!enable) {
      return await changeNotiBrowser(enable);
    }
    if (Push.Permission.has()) {
      return await changeNotiBrowser(enable);
    }
    Push.Permission.request(() => {
      changeNotiBrowser(enable);
    }, () => {
      enqueueSnackbar('开启此功能需要授权使用浏览器通知')
    });
  }

  // 修改浏览器通知
  const changeNotiBrowser = async enable => {
    try {
      await post('/user/notification/setting/browser', new URLSearchParams({ enable }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setUser({ ...user, noti_browser: enable });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 允许转发邮箱
  const onNotiMailCheck = async e => {
    try {
      const enable = e.target.checked;

      await post('/user/notification/setting/mail', new URLSearchParams({ enable }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setUser({ ...user, noti_mail: enable });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ my: 4 }}>
      <Paper elevation={4} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <IconButton aria-label='返回' component={Link} to='/user/notification'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h5'>通知设置</Typography>
        </Stack>
        <Paper variant='outlined' sx={{ p: 2, mt: 3 }}>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Stack>
              <Typography>启用通知提醒</Typography>
              <FormHelperText>
                当有新通知到达时，在窗口右上方弹出消息框显示通知摘要
              </FormHelperText>
            </Stack>
            <Switch inputProps={{ 'aria-label': '允许或禁止通知提醒' }}
              checked={user?.noti_popup || false} onChange={onNotiPopupCheck}
            />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Stack>
              <Typography>启用浏览器通知</Typography>
              <FormHelperText>
                当有新通知到达时，通过浏览器弹出系统通知，该功能需要用户授权允许本网站使用通知
              </FormHelperText>
            </Stack>
            <Switch inputProps={{ 'aria-label': '允许或禁止浏览器通知' }}
              checked={user?.noti_browser || false} onChange={onNotiBrowserCheck}
            />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Stack>
              <Typography>转发到邮箱</Typography>
              <FormHelperText>
                将新通知发送到您的邮箱 {user?.email}
              </FormHelperText>
            </Stack>
            <Switch inputProps={{ 'aria-label': '允许或禁止通知转发邮箱' }}
              checked={user?.noti_mail || false} onChange={onNotiMailCheck}
            />
          </Stack>
        </Paper>
      </Paper>
    </Container>
  )
}
