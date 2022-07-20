import { useRecoilState, useRecoilValue } from "recoil";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useSetCode } from "~/state/code";
import NotFound from "~/comp/notfound";
import Mail from './mail';
import SMS from "./sms";
import Geoip from "./geoip";
import Account from "./account";
import Pay from "./pay";
import Debug from "./debug";
import Image from "./image";
import Nats from "./nats";
import tabState from "./tabstate";

const tabsArray = [
  { title: '邮件服务', value: 1, to: 'mail', },
  { title: '短信服务', value: 2, to: 'sms', },
  { title: '定位服务', value: 3, to: 'geoip', },
  { title: '账号设置', value: 4, to: 'account', },
  { title: '支付服务', value: 5, to: 'pay', },
  { title: '图片存储', value: 6, to: 'image', },
  { title: '消息服务', value: 7, to: 'nats', },
  { title: '诊断模式', value: 8, to: 'debug', },
]

export default function Setting() {
  const [tab, setTab] = useRecoilState(tabState);

  useSetCode(9040);

  return (
    <Container as='main' maxWidth='lg' sx={{ py: 4 }}>
      <Stack direction='row' spacing={8}>
        <Tabs orientation='vertical' value={tab} onChange={(_, v) => setTab(v)}>
          {tabsArray.map(t => (
            <Tab key={t.value} value={t.value} label={t.title}
              LinkComponent={Link} to={t.to}
            />
          ))}
        </Tabs>
        <Box role='tabpanel' sx={{ flex: 1 }}>
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='mail/*' element={<Mail />} />
            <Route path='sms/*' element={<SMS />} />
            <Route path='geoip/*' element={<Geoip />} />
            <Route path='account/*' element={<Account />} />
            <Route path='pay/*' element={<Pay />} />
            <Route path='image/*' element={<Image />} />
            <Route path='nats/*' element={<Nats />} />
            <Route path='debug/*' element={<Debug />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Box>
      </Stack>
    </Container>
  )
}

function Index() {
  const tab = useRecoilValue(tabState);

  let to = 'mail';

  for (let i = 0; i < tabsArray.length; i++) {
    if (tabsArray[i].value === tab) {
      to = tabsArray[i].to;
      break;
    }
  }
  return <Navigate to={to} replace />
}
