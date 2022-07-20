import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import { get } from "~/lib/rest";

export default function Setting() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const [refresh, setRefresh] = useState(true);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('定时任务配置');

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
          setProgress(true);
          await get('/system/task/entries');
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, setProgress, refresh]);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Stack direction='row' alignItems='center' spacing={1} sx={{ my: 3 }}>
        <IconButton aria-label='返回' component={RouteLink} to='..'>
          <Tooltip arrow title='ESC' placement='top'>
            <ArrowBackIcon color='primary' />
          </Tooltip>
        </IconButton>
        <Stack sx={{ flex: 1 }}>
          <Typography variant='h6'>任务配置</Typography>
        </Stack>
      </Stack>
    </Container>
  )
}
