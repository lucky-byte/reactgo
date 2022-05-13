import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSetRecoilState } from 'recoil';
import { useParams } from "react-router-dom";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Divider from '@mui/material/Divider';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import { notificationOutdatedState } from "~/state/notification";
import { useSetCode } from "~/state/code";
import { get } from '~/lib/rest';

export default function Setting() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const setNotificationOutdated = useSetRecoilState(notificationOutdatedState);

  useHotkeys('esc', () => { navigate(-1); }, { enableOnTags: ["INPUT"] });
  useTitle('通知设置');
  useSetCode(0);

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        // const resp = await get('/user/notification/' + params.uuid)
        // setNotification(resp);

        // 如果是未读状态，则请求更新本地通知状态
        if (location?.state?.status === 1) {
          setNotificationOutdated(true);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [
    setProgress, enqueueSnackbar, params.uuid, location?.state?.status,
    setNotificationOutdated,
  ]);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ my: 4 }}>
      <Paper elevation={4} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <IconButton aria-label='返回' component={Link} to='/user/notification'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Typography variant='h5'>通知设置</Typography>
        </Stack>
        <Paper variant='outlined' sx={{ p: 2, mt: 3 }}>
          <Divider sx={{ my: 2 }} />
        </Paper>
      </Paper>
    </Container>
  )
}
