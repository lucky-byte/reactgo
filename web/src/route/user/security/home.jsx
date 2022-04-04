import { useNavigate, Link } from 'react-router-dom';
import { useRecoilValue } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import { useHotkeys } from 'react-hotkeys-hook';
import userState from "~/state/user";
import useTitle from "~/hook/title";

export default function SecurityHome() {
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
        <FormHelperText>
          安全操作码是只有您本人知晓的 6 位数字，
          在执行带有风险的操作时，安全操作码可以提供更多的安全保护
        </FormHelperText>
        <Paper variant='outlined' sx={{ p: 2, mt: 1 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            {user?.secretcode_isset
              ?
              <Typography>安全操作码已设置</Typography>
              :
              <Typography color='error'>还未设置安全操作码</Typography>
            }
            <Button variant='contained' LinkComponent={Link} to='secretcode'>
              {user?.secretcode_isset ? '修改安全操作码' : '设置安全操作码'}
            </Button>
          </Stack>
        </Paper>
        <Typography variant='h6' sx={{ mt: 4 }}>两因素认证</Typography>
        <FormHelperText>
          在进行身份认证时，除了验证密码外，还可以添加第二个认证因子，即使密码泄漏，
          如果没有第二个认证因子，也无法登录您的账户
        </FormHelperText>
        <Paper variant='outlined' sx={{ p: 2, mt: 1 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            {user?.totp_isset ?
              <Typography>两因素认证已设置</Typography>
              :
              <Typography color='error'>还未设置两因素认证</Typography>
            }
            <Button variant='contained' LinkComponent={Link} to='otp'>
              {user?.totp_isset ? '修改两因素认证' : '设置两因素认证'}
            </Button>
          </Stack>
        </Paper>
      </Paper>
    </Container>
  )
}
