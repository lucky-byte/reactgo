import { useNavigate, Link } from 'react-router-dom';
import { useRecoilValue } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import { useHotkeys } from 'react-hotkeys-hook';
import userState from "~/state/user";
import useTitle from "~/hook/title";

export default function Home() {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);

  useHotkeys('esc', () => { navigate('../..'); });
  useTitle('安全设置');

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <IconButton aria-label='返回' component={Link} to='../..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h5'>安全设置</Typography>
        </Stack>
        <Typography variant='h6' sx={{ mt: 4 }}>安全操作码</Typography>
        <Typography variant='body2'>
          安全操作码是只有您本人知晓的 6 位数字，在执行敏感操作时，安全操作码可以提供额外的安全保护
        </Typography>
        <Paper variant='outlined' sx={{ p: 2, mt: 1 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            {user?.secretcode_isset
              ?
              <Typography variant='button' color='green'>安全操作码已设置</Typography>
              :
              <Typography color='error'>还未设置安全操作码</Typography>
            }
            <Button variant='contained' LinkComponent={Link} to='secretcode'>
              {user?.secretcode_isset ? '修改安全操作码' : '设置安全操作码'}
            </Button>
          </Stack>
        </Paper>
        <Typography variant='h6' sx={{ mt: 4 }}>动态密码认证</Typography>
        <Typography variant='body2'>
          在认证时，除密码外还可以添加第二个认证因子，这样即使别人知道了你的密码也无法冒充你的身份
        </Typography>
        <Paper variant='outlined' sx={{ p: 2, mt: 1 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            {user?.totp_isset ?
              <Typography color='green' variant='button'>动态密码认证已设置</Typography>
              :
              <Typography color='error'>还未设置动态密码认证</Typography>
            }
            <Button variant='contained' LinkComponent={Link} to='otp'>
              {user?.totp_isset ? '修改动态密码' : '设置动态密码'}
            </Button>
          </Stack>
        </Paper>
      </Paper>
    </Container>
  )
}
