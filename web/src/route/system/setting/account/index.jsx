import { useRecoilState } from "recoil";
import { Routes, Route, Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useTitle from "~/hook/title";
import NotFound from "~/route/notfound";
import { useAccountTab } from '../tabstate';
import Account from './account';
import tabState from "./state";

export default function Index() {
  const [tab, setTab] = useRecoilState(tabState);

  useTitle('账号设置');
  useAccountTab();

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>账号设置</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="账号设置">
        <Tab value={1} label="账号设置" LinkComponent={Link} to='.' />
        <Tab value={2} label="OIDC 身份认证" LinkComponent={Link} to='oidc' />
        <Tab value={3} label="SAML 单点登录" LinkComponent={Link} to='saml' />
      </Tabs>
      <Box role='tabpanel' sx={{ flex: 1 }}>
        <Routes>
          <Route path='/' element={<Account />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Box>
    </Stack>
  )
}
