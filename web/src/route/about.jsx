import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import titleState from "~/state/title";

export default function About() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('关于'); }, [setTitle]);

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper variant='outlined' sx={{ mt: 4, px: 4, py: 3 }}>
        <Typography variant='h6'>系统信息</Typography>
        <Divider />
        <Stack sx={{ mt: 2 }} spacing={2}>
          <Row title='系统名称:' value={process.env.REACT_APP_NAME} />
          <Row title='系统版本:' value={process.env.REACT_APP_VERSION} />
          <Row title='内部代码:' value='ZK-1321-3200' />
          <Row title='版权声明:' value={
            '版权所有 © ' + new Date().getFullYear() + ' ' +
            process.env.REACT_APP_COMPANY_NAME_FULL}
          />
        </Stack>
        <Typography variant='h6' sx={{ mt: 4 }}>系统开发商信息</Typography>
        <Divider />
        <Stack sx={{ mt: 2 }} spacing={2}>
          <Row title='系统开发商:' value={process.env.REACT_APP_DEV_NAME} />
          <Row title='联系邮箱:' value={process.env.REACT_APP_DEV_EMAIL} />
          <Row title='联系电话:' value={process.env.REACT_APP_DEV_TEL} />
          <Row title='联系地址:' value={process.env.REACT_APP_DEV_ADDRESS} />
        </Stack>
      </Paper>
    </Container>
  )
}

function Row(props) {
  return (
    <Stack direction='row'>
      <Typography sx={{ minWidth: '100px' }} variant='body2'>
        {props.title}
      </Typography>
      <Typography variant='body2'>{props.value}</Typography>
    </Stack>
  )
}
