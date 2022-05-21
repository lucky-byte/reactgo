import { lazy, useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Fab from '@mui/material/Fab';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import readingTime from 'reading-time/lib/reading-time';
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import EllipsisText from "~/comp/ellipsis-text";
import { get } from '~/public/fetch';
import Banner from '~/comp/banner';
import Footer from '~/comp/footer';

const Markdown = lazy(() => import('~/comp/markdown'));

export default function Item() {
  const theme = useTheme();
  const md_up = useMediaQuery(theme.breakpoints.up('md'));
  const params = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [bulletin, setBulletin] = useState({});
  const [scrollVisible, setScrollVisible] = useState(false);
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
        if (resp) {
          const stats = readingTime(resp.content, { wordsPerMinute: 400 });
          resp.readingTime = stats.minutes;
          setBulletin(resp || {});
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, params.uuid]);

  // 关闭
  const onCloseClick = () => {
    navigate('..');
  }

  // 点赞
  const onStarClick = () => {
    setBulletin({ ...bulletin, star: !bulletin.star });
  }

  const onWindowScroll = useCallback(e => {
    setScrollVisible(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onWindowScroll);

    return () => {
      window.removeEventListener('scroll', onWindowScroll);
    }
  }, [onWindowScroll]);

  // 滚动到顶部
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
          <Chip size='small' label='公告' color='info' icon={<CampaignIcon />}
            onClick={onCloseClick}
          />
        </Stack>
      </Toolbar>
      <Stack spacing={2} direction='row' alignItems='center' sx={{ mb: 2 }}
        justifyContent={md_up ? 'flex-start' : 'flex-end'}>
        {md_up &&
          <Breadcrumbs aria-label="导航" sx={{ flex: 1, minWidth: 0 }}>
            <Link underline="hover" color="primary" variant="button"
              component={RouteLink} to="..">
              公告
            </Link>
            <EllipsisText variant='body2' sx={{ textAlign: 'left', maxWidth: 400 }}>
              {bulletin.title || '无'}
            </EllipsisText>
          </Breadcrumbs>
        }
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
      {loading ? <Placeholder /> : (bulletin.uuid ?
        <>
          <Typography variant='h4' textAlign='center' gutterBottom>
            {bulletin.title}
          </Typography>
          <Typography variant='caption' paragraph textAlign='center'>
            {dayjs(bulletin.send_time).format('LL dddd HH:mm:ss')}
          </Typography>
          <Stack direction='row' alignItems='center' spacing={2} mb={1}>
            <Stack direction='row' flex={1}>
              <Typography variant='caption'>
                约 {Math.ceil(bulletin.readingTime)} 分钟
              </Typography>
            </Stack>
            <Stack direction='row' spacing={1} alignItems='center'>
              <VisibilityIcon sx={{ fontSize: '0.9rem', color: 'gray' }} />
              <Tooltip title='浏览' arrow>
                <Typography variant='body2'>{bulletin.nread}</Typography>
              </Tooltip>
            </Stack>
            <Tooltip title='点赞' arrow>
              <Chip size='small' sx={{ px: 1 }}
                color={bulletin.star ? 'warning' : 'primary'}
                label={bulletin.nstar}
                icon={bulletin.star ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
                onClick={onStarClick}
              />
            </Tooltip>
          </Stack>
          <Markdown>{bulletin.content}</Markdown>
        </>
        :
        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle>您访问的公告不存在！</AlertTitle>
          <Typography variant='body2'>可能的原因：</Typography>
          <ol>
            <li>网址输入错误</li>
            <li>该公告已被系统撤回</li>
          </ol>
          <Typography variant='body2'>
            当前访问网址：{window.location.href}
          </Typography>
        </Alert>
      )}
      <Divider sx={{ mt: 6, mb: 4 }} />
      <Footer />

      {scrollVisible && md_up && (
        <Tooltip title='到顶部' arrow>
          <Fab aria-label="转到页面顶部" size="small" color='primary'
            onClick={onScrollTop}
            sx={{ position: 'fixed', bottom: 100, right: 80 }}>
            <ArrowUpwardIcon />
          </Fab>
        </Tooltip>
      )}
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
