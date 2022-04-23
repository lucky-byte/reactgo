import { Link as RouteLink } from 'react-router-dom';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import alipay from '~/img/alipay.png';

export default function Alipay(props) {
  return (
    <Paper variant='outlined' sx={{ p: 3 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack direction='row' spacing={1} alignItems='center'>
          <img src={alipay} alt='logo' width={32} />
          <Stack>
            <Typography variant='h6'>支付宝</Typography>
            <Typography variant='caption'>未开通</Typography>
          </Stack>
        </Stack>
        <Button color='success' variant='contained' LinkComponent={RouteLink} to='alipay'>
          立即开通
        </Button>
      </Stack>
    </Paper>
  )
}
