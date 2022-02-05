import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Link as RouteLink, useLocation, useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CheckIcon from '@mui/icons-material/Check';
import Banner from '~/img/banner.png';
import BannerDark from '~/img/banner-dark.png';

export default function ResetPassSuccess() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const Logo = theme.palette.mode === 'dark' ? BannerDark : Banner;

  useEffect(() => { document.title = '密码已重置'; }, []);

  // 获取路由参数
  useEffect(() => {
    if (!location?.state) {
      return navigate('/resetpass', { replace: true });
    }
    setEmail(location.state.email);
  }, [navigate, location?.state]);

  return (
    <Stack as='main' role='main'>
      <Toolbar>
        <Box sx={{ flex: 1 }}>
          <Link component='a' href='/signin'>
            <img src={Logo} alt='Logo' height='28px' />
          </Link>
        </Box>
      </Toolbar>
      <Container maxWidth='xs'
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ mt: 6, py: 3, px: 4, width: '100%' }}>
          <Stack alignItems='center' spacing={2}>
            <CheckIcon color='success' sx={{ fontSize: '96px' }} />
            <Typography as='h1' variant="h6">密码已重置</Typography>
            <Typography variant='body2' sx={{ textAlign: 'center' }}>
              新密码已发送到您的邮箱 {email}，请注意查收
            </Typography>
          </Stack>
          <Button fullWidth sx={{ mt: 4 }} LinkComponent={RouteLink} to='/signin'>
            去登录
          </Button>
        </Paper>
      </Container>
    </Stack>
  )
}
