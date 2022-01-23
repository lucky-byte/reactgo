import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import { Routes, Route, Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import titleState from "../../../state/title";
import NotFound from "../../notfound";
import Generic from './generic';
import Mail from './mail';
import SMS from './sms';
import Secure from './secure';

export default function Settings() {
  const setTitle = useSetRecoilState(titleState);
  const [tabValue, setTabValue] = useState(1);

  useEffect(() => { setTitle('系统设置'); }, [setTitle]);

  return (
    <Container as='main' maxWidth='md' sx={{ py: 2 }}>
      <Tabs centered value={tabValue} onChange={(e, v) => setTabValue(v)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab value={1} label="常规" LinkComponent={Link} to='.' />
        <Tab value={2} label="邮件" LinkComponent={Link} to='mail' />
        <Tab value={3} label="短信" LinkComponent={Link} to='sms' />
        <Tab value={4} label="安全" LinkComponent={Link} to='secure' />
      </Tabs>
      <Routes>
        <Route path='/' element={<Generic />} />
        <Route path='mail' element={<Mail />} />
        <Route path='sms' element={<SMS />} />
        <Route path='secure' element={<Secure />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Container>
  )
}
