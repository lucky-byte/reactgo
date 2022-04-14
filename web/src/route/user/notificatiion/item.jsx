import { lazy, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from 'recoil';
import { useParams } from "react-router-dom";
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import { notificationOutdatedState } from "~/state/notification";
import usePrint from "~/hook/print";
import { get } from '~/rest';

const Markdown = lazy(() => import('~/comp/markdown'));

export default function Item() {
  const params = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const setNotificationOutdated = useSetRecoilState(notificationOutdatedState);
  const [notification, setNotification] = useState({});

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('通知');

  const contentRef = useRef();
  const print = usePrint(contentRef.current);

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/user/notification/' + params.uuid)

        setNotification(resp);
        setNotificationOutdated(true);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [setProgress, enqueueSnackbar, params.uuid, setNotificationOutdated]);

  const onCloseClick = () => {
    navigate('..');
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ my: 3 }} ref={contentRef}>
      <Stack spacing={2} direction='row' justifyContent='flex-end'>
        <IconButton onClick={print}>
          <PrintIcon />
        </IconButton>
        <IconButton onClick={onCloseClick}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Typography variant='h4' textAlign='center' gutterBottom>
        {notification.title}
      </Typography>
      <Typography variant='caption' paragraph textAlign='center'>
        {dayjs(notification.create_at).format('LLLL')}
      </Typography>
      <Markdown>{notification.content}</Markdown>
    </Container>
  )
}
