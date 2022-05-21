import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useTitle from "~/hook/title";
import WXPay from "./wxpay";
import Alipay from "./alipay";
import { usePayTab } from '../tabstate';

export default function Home() {
  useTitle('支付服务');
  usePayTab();

  return (
    <Stack>
      <Typography variant='h4'>支付服务</Typography>
      <Typography variant='body2'>
        开通支付服务后可以使用聚合码收款功能，也可以将支付服务集成到业务流程中
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
