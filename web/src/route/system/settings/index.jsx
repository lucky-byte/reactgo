import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Container from "@mui/material/Container";
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import useTitle from "~/hook/title";
import NotFound from "~/route/notfound";
import Generic from './generic';
import Mail from './mail';
import SMS from './sms';
import GeoIP from './geoip';
import Account from './account';

export default function Settings() {
  const location = useLocation();
  const [tabValue, setTabValue] = useState(1);

  useTitle('系统设置');

  useEffect(() => {
    const pathname = location?.pathname;
    if (!pathname) {
      return;
    }
    if (pathname.includes('/mail')) {
      return setTabValue(2);
    }
    if (pathname.includes('/sms')) {
      return setTabValue(3);
    }
    if (pathname.includes('/geoip')) {
      return setTabValue(4);
    }
    if (pathname.includes('/account')) {
      return setTabValue(5);
    }
  }, [location?.pathname]);

  return (
    <Container as='main' maxWidth='md' sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Tabs centered value={tabValue} onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab value={1} label="常规" LinkComponent={Link} to='.' />
          <Tab value={2} label="邮件" LinkComponent={Link} to='mail' />
          <Tab value={3} label="短信" LinkComponent={Link} to='sms' />
          <Tab value={4} label="IP定位" LinkComponent={Link} to='geoip' />
          <Tab value={5} label="账号" LinkComponent={Link} to='account' />
        </Tabs>
        <Routes>
          <Route path='/' element={<Generic />} />
          <Route path='mail/*' element={<Mail />} />
          <Route path='sms' element={<SMS />} />
          <Route path='geoip' element={<GeoIP />} />
          <Route path='account' element={<Account />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Paper>
    </Container>
  )
}
