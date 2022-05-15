import { lazy, useEffect, useState, useRef } from "react";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import { useSetRecoilState } from 'recoil';
import { useParams } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import { get } from '~/lib/rest';
import Banner from '~/comp/banner';

const Markdown = lazy(() => import('~/comp/markdown'));

export default function Item() {
  const params = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const [bulletin, setBulletin] = useState({});

  useHotkeys('esc', () => { navigate(-1); }, { enableOnTags: ["INPUT"] });
  useTitle('公告');

  const contentRef = useRef();
  const print = usePrint(contentRef.current);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/bulletin/' + params.uuid)
        setBulletin(resp);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [setProgress, enqueueSnackbar, params.uuid]);

  const onCloseClick = () => {
    navigate(-1);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 6 }} ref={contentRef}>
      <Toolbar disableGutters>
        <Stack direction='row' alignItems='flex-end' spacing={3} sx={{ flex: 1 }}>
          <Link component={RouteLink} to='/'>
            <Banner height={28} />
          </Link>
          <Chip size='small' label='公告' variant='outlined' color='info'
            icon={<CampaignIcon />}
          />
        </Stack>
      </Toolbar>
      <Stack spacing={2} direction='row' justifyContent='flex-end'>
        <Tooltip title='打印'>
          <IconButton onClick={print}>
            <PrintIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title='关闭'>
          <IconButton onClick={onCloseClick}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant='h4' textAlign='center' gutterBottom>
        {bulletin.title}
      </Typography>
      {bulletin.create_at &&
        <Typography variant='caption' paragraph textAlign='center'>
          发布时间：{dayjs(bulletin.send_time).format('LLLL')}
        </Typography>
      }
      <Markdown>{bulletin.content}</Markdown>
    </Container>
  )
}
