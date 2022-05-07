import { useNavigate, Link as RouteLink } from 'react-router-dom';
import { useRecoilValue } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import AppleIcon from '@mui/icons-material/Apple';
import { useHotkeys } from 'react-hotkeys-hook';
import userState from "~/state/user";
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import Google from '~/img/google.svg';
import Microsoft from '~/img/microsoft.svg';
import GitHub from './github';

export default function Home() {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);

  useHotkeys('esc', () => { navigate('/user'); });
  useTitle('身份授权');
  useSetCode(0);

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <IconButton aria-label='返回' component={RouteLink} to='/user'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack>
            <Typography variant='h5'>身份授权</Typography>
            <Typography variant='body2'>
              您可以授权使用您在下列网站拥有的账号登录本系统
            </Typography>
          </Stack>
        </Stack>
        <Paper variant='outlined' sx={{ p: 2, mt: 3 }}>
          <GitHub />
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
              <Box width={35} height={35} display='flex' justifyContent='center'>
                <img src={Google} alt='LOGO' style={{ width: 28 }} />
              </Box>
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
              <Box width={35} height={35} display='flex' justifyContent='center'>
                <img src={Microsoft} alt='LOGO' style={{ width: 28 }} />
              </Box>
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
      </Paper>
    </Container>
  )
}
