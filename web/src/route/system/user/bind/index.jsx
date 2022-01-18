import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate, Routes, Route } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import titleState from "../../../../state/title";
import BindMerch from './merch';
import BindBank from './bank';

export default function UserBind() {
  const location = useLocation();
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState('merch');

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });

  useEffect(() => { setTitle('用户绑定配置'); }, [setTitle]);

  if (!location.state?.uuid) {
    return <Navigate to='..' />
  }

  const onTabChange = (e, v) => {
    setTabValue(v);
    navigate(v, { state: location?.state });
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 2 }}>
      <Paper elevation={3} sx={{ px: 5, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' sx={{ mb: 3 }}>
          <IconButton onClick={() => { navigate('..') }} sx={{ mr: 1 }}>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack>
            <Typography variant='h6'>绑定配置</Typography>
            <Typography variant='subtitle1' color='secondary'>
              {location?.state?.name}
            </Typography>
          </Stack>
        </Stack>
        <Tabs value={tabValue} onChange={onTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="商户绑定" value="merch" />
          <Tab label="渠道绑定" value="bank" />
        </Tabs>
        <Routes>
          <Route path='/' element={<BindMerch />} />
          <Route path='merch' element={<BindMerch />} />
          <Route path='bank' element={<BindBank />} />
        </Routes>
      </Paper>
    </Container>
  )
}
