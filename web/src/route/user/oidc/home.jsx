import { useNavigate, Link as RouteLink } from 'react-router-dom';
import { useRecoilValue } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import WindowIcon from '@mui/icons-material/Window';
import { useHotkeys } from 'react-hotkeys-hook';
import userState from "~/state/user";
import useTitle from "~/hook/title";

export default function Home() {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);

  useHotkeys('esc', () => { navigate('../..'); });
  useTitle('绑定账号');

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <IconButton aria-label='返回' component={RouteLink} to='../..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack>
            <Typography variant='h5'>绑定第三方账号</Typography>
            <Typography variant='caption'>
              你可以使用 OpenID Connect 协议授权下列第三方账号登录本系统
            </Typography>
          </Stack>
        </Stack>
        <Paper variant='outlined' sx={{ p: 2, mt: 3 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <GitHubIcon fontSize='large' />
              <Stack>
                <Typography variant='h6'>GitHub</Typography>
                <Typography variant='caption'>未授权</Typography>
              </Stack>
            </Stack>
            <Button variant='contained' LinkComponent={RouteLink} to='secretcode'>
              授权
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <AppleIcon fontSize='large' />
              <Stack>
                <Typography variant='h6'>Apple</Typography>
                <Typography variant='caption'>未授权</Typography>
              </Stack>
            </Stack>
            <Button variant='contained' LinkComponent={RouteLink} to='secretcode'>
              授权
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <GoogleIcon fontSize='large' />
              <Stack>
                <Typography variant='h6'>Google</Typography>
                <Typography variant='caption'>未授权</Typography>
              </Stack>
            </Stack>
            <Button variant='contained' LinkComponent={RouteLink} to='secretcode'>
              授权
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <WindowIcon fontSize='large' />
              <Stack>
                <Typography variant='h6'>Microsoft</Typography>
                <Typography variant='caption'>未授权</Typography>
              </Stack>
            </Stack>
            <Button variant='contained' LinkComponent={RouteLink} to='secretcode'>
              授权
            </Button>
          </Stack>
        </Paper>
        <Typography variant='caption'>
          OpenID Connect 是基于 OAuth 2.0 系列规范的可互操作身份验证协议，更多信息请参考
          <Link href='https://openid.net/connect/' target='_blank'>
            https://openid.net/connect
          </Link>
        </Typography>
      </Paper>
    </Container>
  )
}
