import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import progressState from "~/state/progress";
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import { get } from '~/lib/rest';
import Info from './info';

export default function Home() {
  const navigate = useNavigate();
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState('');
  const [reloadAll, setReloadAll] = useState(true);
  const [acls, setAcls] = useState([]);
  const [info, setInfo] = useState({});

  useTitle('访问控制');
  useSetCode(9010);

  useEffect(() => {
    (async () => {
      try {
        if (tabValue) {
          setProgress(true);

          const query = new URLSearchParams({ uuid: tabValue });
          const resp = await get('/system/acl/info?' + query.toString());
          setInfo(resp || {});
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress, tabValue]);

  useEffect(() => {
    (async () => {
      try {
        if (reloadAll) {
          setProgress(true);

          const resp = await get('/system/acl/');
          if (resp.acls && resp.acls.length > 0) {
            let uuid = resp.acls[0].uuid;

            const last_uuid = localStorage.getItem('last-acl-uuid');
            if (last_uuid) {
              uuid = last_uuid;
            }
            setTabValue(uuid);
          }
          setAcls(resp.acls || []);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
        setReloadAll(false);
      }
    })();
  }, [enqueueSnackbar, setProgress, reloadAll]);

  const onSearchClick = () => {
  }

  const onAddClick = () => {
    navigate('add');
  }

  const onTabChange = async (e, uuid) => {
    setTabValue(uuid);
    localStorage.setItem('last-acl-uuid', uuid);
  };

  return (
    <Container as='main' maxWidth='md' sx={{ py: 4 }}>
      <Stack direction='row' spacing={2}>
        <Paper elevation={0} sx={{ width: 200 }}>
          <Stack>
            <Stack direction='row' alignItems='center' sx={{ pl: 2, py: '3px' }}>
              <Stack direction='row' alignItems='baseline' sx={{ flex: 1 }}>
                <Typography variant='h6' sx={{ mr: 1 }}>角色</Typography>
                <Typography variant='body2' color='gray'>{acls.length} 项</Typography>
              </Stack>
              <IconButton aria-label='搜索' onClick={onSearchClick}>
                <SearchIcon fontSize='small' />
              </IconButton>
              <IconButton aria-label='添加' onClick={onAddClick}>
                <AddIcon color='primary' />
              </IconButton>
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <Tabs orientation="vertical" value={tabValue} onChange={onTabChange}>
              {acls.map(a => (
                <Tab key={a.uuid} value={a.uuid} sx={{ alignItems: 'flex-start' }}
                  label={
                    <Stack direction='row' alignItems='center' sx={{ width: '100%' }}>
                      <Typography variant='button' textAlign='left' sx={{ flex: 1 }}>
                        {a.name}
                      </Typography>
                      <Typography variant='button' color='gray' sx={{ ml: 1 }}>
                        {a.usercount}
                      </Typography>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Stack>
        </Paper>
        <Info info={info} setInfo={setInfo} acls={acls} setAcls={setAcls}
          setReloadAll={setReloadAll}
        />
      </Stack>
    </Container>
  )
}
