import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useTitle from "~/hook/title";
import { usePayTab } from '../state';
import WXPay from "./wxpay";
import Alipay from "./alipay";

export default function Home() {
  useTitle('支付服务');
  usePayTab();

  return (
    <Stack>
      <Typography variant='h4'>支付服务</Typography>
      <Typography variant='body2'>
        开通支付服务后可以使用微信支付、支付宝进行收款，个体工商户、企事业单位均可开通
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Stack spacing={2}>
          <WXPay />
          <Alipay />
        </Stack>
      </Paper>
    </Stack>
  )
}
