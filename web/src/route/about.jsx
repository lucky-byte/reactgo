import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";

export default function About() {
  useTitle('关于');
  useSetCode(0);

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper variant='outlined' sx={{ mt: 4, px: 4, py: 3 }}>
        <Typography variant='h6'>系统信息</Typography>
        <Divider />
        <Stack sx={{ mt: 2 }} spacing={2}>
          <Row title='系统名称:' value={process.env.REACT_APP_NAME} />
          <Row title='系统版本:' value={process.env.REACT_APP_VERSION} />
          <Row title='系统序号:' value='ZK-1321-3200' />
          <Row title='版权声明:' value={
            '版权所有 © ' + new Date().getFullYear() + ' ' +
            process.env.REACT_APP_COMPANY_NAME_FULL}
          />
        </Stack>
        <Typography variant='h6' sx={{ mt: 4 }}>开发团队</Typography>
        <Divider />
        <Stack sx={{ mt: 2 }} spacing={2}>
          <Row title='开发团队:' value={process.env.REACT_APP_DEV_NAME} />
          <Row title='联系邮箱:' value={process.env.REACT_APP_DEV_EMAIL} />
          <Row title='联系电话:' value={process.env.REACT_APP_DEV_TEL} />
          <Row title='联系地址:' value={process.env.REACT_APP_DEV_ADDRESS} />
          <Stack direction='row'>
            <Typography sx={{ minWidth: '100px' }} variant='body2'>
              项目网站:
            </Typography>
            <Typography variant='body2'>
              <Link href={process.env.REACT_APP_DEV_URL} target='_blank'
                underline='hover'>
                {process.env.REACT_APP_DEV_URL}
              </Link>
            </Typography>
          </Stack>
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
