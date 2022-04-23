import { useRecoilState, useRecoilValue } from "recoil";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import NotFound from "~/route/notfound";
import tabState from "./state";
import Mail from './mail';
import SMS from "./sms";

const tabsArray = [
  { title: '邮件服务', value: 1, to: 'mail', },
  { title: '短信服务', value: 2, to: 'sms', },
  { title: '定位服务', value: 3, to: 'geoip', },
  { title: '账号设置', value: 4, to: 'account', },
  { title: 'OIDC认证', value: 5, to: 'oidc', },
  { title: '单点登录', value: 6, to: 'saml', },
]

export default function Setting() {
  const [tab, setTab] = useRecoilState(tabState);

  return (
    <Container as='main' maxWidth='lg' sx={{ py: 4 }}>
      <Stack direction='row' spacing={8}>
        <Tabs orientation='vertical' value={tab} onChange={(e, v) => setTab(v)}>
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
