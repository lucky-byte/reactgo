import { lazy, useEffect, useState, useRef } from "react";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import { get } from '~/lib/rest';
import Banner from '~/comp/banner';
import Footer from '~/comp/footer';

const Markdown = lazy(() => import('~/comp/markdown'));

export default function Item() {
  const params = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [bulletin, setBulletin] = useState({});
  const [loading, setLoading] = useState(true);

  useHotkeys('esc', () => { navigate(-1); }, { enableOnTags: ["INPUT"] });
  useTitle('公告');

  const contentRef = useRef();
  const print = usePrint(contentRef.current);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await get('/bulletin/' + params.uuid)
        setBulletin(resp);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, params.uuid]);

  const onCloseClick = () => {
    navigate('/bulletin');
  }

  const onScrollTop = () => {
    contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ my: 4 }} ref={contentRef}>
      <Toolbar disableGutters>
        <Stack direction='row' alignItems='flex-end' spacing={3} sx={{ flex: 1 }}>
          <Link component={RouteLink} to='/'>
            <Banner height={28} />
          </Link>
          <Chip size='small' label='公告' variant='outlined' color='info'
            icon={<CampaignIcon />} onClick={onCloseClick}
          />
        </Stack>
      </Toolbar>
      <Stack spacing={2} direction='row' justifyContent='flex-end' sx={{ mb: 2 }}>
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
      {loading ? <Placeholder /> :
        <>
          <Typography variant='h4' textAlign='center' gutterBottom>
            {bulletin.title}
          </Typography>
          <Typography variant='caption' paragraph textAlign='center'>
            {dayjs(bulletin.send_time).format('LLLL')}
          </Typography>
          <Markdown>{bulletin.content}</Markdown>
        </>
      }
      <Fab aria-label="转到页面顶部" size="small" onClick={onScrollTop}
        sx={{ position: 'fixed', bottom: 30, right: 30 }}>
        <ArrowUpwardIcon />
      </Fab>
      <Divider sx={{ mt: 6, mb: 4 }} />
      <Footer />
    </Container>
  )
}

function Placeholder() {
  return (
    <Stack alignItems='center'>
      <Typography variant='h4' width='50%'><Skeleton /></Typography>
      <Typography variant='caption' width='30%'><Skeleton /></Typography>
      <Stack mt={3} width='100%'>
        <Typography variant='body1'><Skeleton /></Typography>
        <Typography variant='body1'><Skeleton /></Typography>
        <Typography variant='body1'><Skeleton /></Typography>
        <Typography variant='body1'><Skeleton /></Typography>
        <Typography variant='body1'><Skeleton /></Typography>
        <Typography variant='body1'><Skeleton /></Typography>
        <Typography variant='body1' width='50%'><Skeleton /></Typography>
      </Stack>
    </Stack>
  )
}
