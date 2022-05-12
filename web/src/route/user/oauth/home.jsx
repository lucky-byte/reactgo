import { useNavigate, Link as RouteLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Divider from '@mui/material/Divider';
import { useHotkeys } from 'react-hotkeys-hook';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import GitHub from './github';
import Google from './google';

export default function Home() {
  const navigate = useNavigate();

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
          <Google />
        </Paper>
      </Paper>
    </Container>
  )
}
