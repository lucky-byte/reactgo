import { useRecoilState, useRecoilValue } from "recoil";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useTitle from "~/hook/title";
import NotFound from "~/comp/notfound";
import { useAccountTab } from '../tabstate';
import tabState from "./state";
import Secure from './secure';
import OAuth from "./oauth";

const tabsArray = [
  { title: '账号安全', value: 1, to: 'secure', },
  { title: '身份授权', value: 2, to: 'oauth', },
  // { title: '单点登录', value: 3, to: 'saml', },
  // { title: '身份提供', value: 4, to: 'oidc', },
]

export default function Account() {
  const [tab, setTab] = useRecoilState(tabState);

  useTitle('账号设置');
  useAccountTab();

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>账号设置</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="账号设置">
          {tabsArray.map(t => (
            <Tab key={t.value} value={t.value} label={t.title}
              LinkComponent={Link} to={t.to}
            />
          ))}
        </Tabs>
      </Box>
      <Box role='tabpanel' sx={{ flex: 1 }}>
        <Routes>
          <Route path='/' element={<Index />} />
          <Route path='secure/*' element={<Secure />} />
          <Route path='oauth/*' element={<OAuth />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Box>
    </Stack>
  )
}

function Index() {
  const tab = useRecoilValue(tabState);

  let to = 'secure';

  for (let i = 0; i < tabsArray.length; i++) {
    if (tabsArray[i].value === tab) {
      to = tabsArray[i].to;
      break;
    }
  }
  return <Navigate to={to} replace />
}
