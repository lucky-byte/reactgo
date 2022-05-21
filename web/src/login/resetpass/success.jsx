import { useEffect, useState } from "react";
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
import useTitle from "~/hook/title";
import Banner from '~/comp/banner';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useTitle('密码已重置');

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
          <Link component={RouteLink} to='/signin'>
            <Banner height={28} />
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
              新密码已发送到下面的邮箱地址，请注意查收
            </Typography>
            <Typography variant='subtitle2' sx={{ textAlign: 'center' }}>
              {email}
            </Typography>
          </Stack>
          <Button variant="outlined" size="large" fullWidth sx={{ mt: 6, mb: 3 }}
            LinkComponent={RouteLink} to='/signin'>
            去登录
          </Button>
        </Paper>
      </Container>
    </Stack>
  )
}
