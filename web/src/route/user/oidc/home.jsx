import { useNavigate, Link } from 'react-router-dom';
import { useRecoilValue } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useHotkeys } from 'react-hotkeys-hook';
import userState from "~/state/user";
import useTitle from "~/hook/title";
import Google from '~/img/google.svg';
import Microsoft from '~/img/microsoft.svg';

export default function Home() {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);

  useHotkeys('esc', () => { navigate('../..'); });
  useTitle('三方账号');

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <IconButton aria-label='返回' component={Link} to='../..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack>
            <Typography variant='h5'>三方账号</Typography>
            <Typography variant='caption'>
              使用 OpenID Connect 标准协议授权第三方账号登录本系统
            </Typography>
          </Stack>
        </Stack>
        <Paper variant='outlined' sx={{ p: 2, mt: 3 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <GitHubIcon sx={{ width: 28, height: 28 }} />
              <Stack>
                <Typography variant='h6'>GitHub</Typography>
                <Typography variant='caption'>未授权</Typography>
              </Stack>
            </Stack>
            <Button variant='contained' LinkComponent={Link} to='secretcode'>
              授权
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <img src={Google} alt='Google' width={28} height={28} />
              <Stack>
                <Typography variant='h6'>Google</Typography>
                <Typography variant='caption'>未授权</Typography>
              </Stack>
            </Stack>
            <Button variant='contained' LinkComponent={Link} to='secretcode'>
              授权
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <img src={Microsoft} alt='MS' width={28} height={28} />
              <Stack>
                <Typography variant='h6'>Microsoft</Typography>
                <Typography variant='caption'>未授权</Typography>
              </Stack>
            </Stack>
            <Button variant='contained' LinkComponent={Link} to='secretcode'>
              授权
            </Button>
          </Stack>
        </Paper>
      </Paper>
    </Container>
  )
}
