import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from "recoil";
import { Link as RouteLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useSnackbar } from 'notistack';
import InplaceInput from '~/comp/inplace-input';
import titleState from "~/state/title";
import userState from "~/state/user";
import { put } from "~/rest";

export default function UserProfile() {
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => { setTitle('个人资料'); }, [setTitle]);

  // 修改邮箱地址
  const onChangeEmail = async value => {
    enqueueSnackbar('暂不支持修改邮箱地址', { variant: 'info' });
  }

  // 修改手机号
  const onChangeMobile = async value => {
    enqueueSnackbar('暂不支持修改手机号', { variant: 'info' });
  }

  // 修改联系地址
  const onChangeAddress = async value => {
    try {
      await put('/user/address', new URLSearchParams({ address: value }));
      setUser({ ...user, address: value, });
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ mt: 4, px: 4, py: 3 }}>
        <Stack direction='row' spacing={3}>
          <Avatar sx={{ width: 96, height: 96 }} />
          <Stack spacing={2} width='100%'>
            <Stack direction='row'>
              <Stack sx={{ flex: 1 }}>
                <Typography variant='h6'>{user?.name}</Typography>
                <Typography>@{user?.userid}</Typography>
              </Stack>
              <Stack direction='row' spacing={2}>
                <Button LinkComponent={RouteLink} to='/user/password'>修改密码</Button>
                <Button LinkComponent={RouteLink} to='/user/security'>安全设置</Button>
              </Stack>
            </Stack>
            <Divider />
            <Stack direction='row' spacing={1} alignItems='center'>
              <Tooltip title='邮箱地址'>
                <EmailIcon fontSize='small' color='primary' />
              </Tooltip>
              <InplaceInput sx={{ flex: 1 }} text={user?.email || ''}
                onConfirm={onChangeEmail}
              />
            </Stack>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Tooltip title='手机号码'>
                <PhoneIcon fontSize='small' color='primary' />
              </Tooltip>
              <InplaceInput sx={{ flex: 1 }} text={user?.mobile || ''}
                maxLength={11} onConfirm={onChangeMobile}
              />
            </Stack>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Tooltip title='联系地址'>
                <LocationOnIcon fontSize='small' color='primary' />
              </Tooltip>
              <InplaceInput sx={{ flex: 1 }} text={user?.address || ''}
                onConfirm={onChangeAddress}
              />
            </Stack>
          </Stack>
        </Stack>
        <Stack sx={{ mt: 4 }}>
          <Typography variant='h6'>访问设备</Typography>
          <FormHelperText>
            访问设备通过浏览器设置的 User Agent 识别，系统仅使用这些信息增强安全，
            不与任何第三方共享，详情请参考
            <Link component='a' href='/privace' target='_blank' underline='hover'>
              《隐私政策》
            </Link>
          </FormHelperText>
        </Stack>
        <Stack sx={{ mt: 3 }}>
          <Typography variant='h6'>安全日志</Typography>
          <FormHelperText>
            IP 地址通过网络连接获取，地理位置通过 IP 查询而来，这些信息用于增强安全，
            不与任何第三方分享，详情请参考
            <Link component='a' href='/privace' target='_blank' underline='hover'>
              《隐私政策》
            </Link>
          </FormHelperText>
        </Stack>
      </Paper>
    </Container>
  )
}
