import { Link as RouteLink } from 'react-router-dom';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import wxpay from '~/img/wxpay.png';

export default function WXPay(props) {
  return (
    <Paper variant='outlined' sx={{ p: 3 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack direction='row' spacing={1} alignItems='center'>
          <img src={wxpay} alt='logo' width={32} />
          <Stack>
            <Typography variant='h6'>微信支付</Typography>
            <Typography variant='caption'>未开通</Typography>
          </Stack>
        </Stack>
        <Button color='success' variant='contained'
          LinkComponent={RouteLink} to='wxpay'>
          立即开通
        </Button>
      </Stack>
    </Paper>
  )
}
