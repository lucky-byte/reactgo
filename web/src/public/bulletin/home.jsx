import { useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CampaignIcon from '@mui/icons-material/Campaign';
import FitbitIcon from '@mui/icons-material/Fitbit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useSnackbar } from 'notistack';
import EllipsisText from "~/comp/ellipsis-text";
import SearchBar from '~/comp/search-bar';
import TimeAgo from '~/comp/timeago';
import useTitle from "~/hook/title";
import Banner from '~/comp/banner';
import Footer from '~/comp/footer';
import { get } from '~/public/fetch';

export default function Home() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(15);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useTitle('公告');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams({ page, rows, keyword });
        const resp = await get('/bulletin/?' + query.toString());
        if (resp.count > 0) {
          let pages = resp.count / rows;
          if (resp.count % rows > 0) {
            pages += 1;
          }
          setPageCount(parseInt(pages));
        } else {
          setPageCount(0);
        }
        setCount(resp.count);
        setList(resp.list || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, page, rows, keyword]);

  // 搜索
  const onKeywordChange = e => {
    setPage(0);
    setKeyword(e.target.value);
  }

  const onItemClick = item => {
    navigate(item.uuid);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ my: 4 }}>
      <Toolbar disableGutters>
        <Stack direction='row' alignItems='flex-end' spacing={3} sx={{ flex: 1 }}>
          <Link component={RouteLink} to='/'>
            <Banner height={28} />
          </Link>
          <Chip size='small' label='公告' color='info' icon={<CampaignIcon />} />
        </Stack>
        <SearchBar value={keyword} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : '搜索...'}
        />
      </Toolbar>
      <Paper sx={{ mt: 3 }}>
        <List>
          {list.map((item, i) => (
            <ListItem key={item.uuid} divider={i < list.length - 1}>
              <ListItemText sx={{ mx: 2 }} disableTypography
                primary={
                  <Stack direction='row' alignItems='center' spacing={2} mb={1}>
                    <Link underline='hover' sx={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => onItemClick(item)}>
                      <EllipsisText variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {item.title}
                      </EllipsisText>
                    </Link>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Tooltip title='浏览' arrow>
                        <VisibilityIcon sx={{ fontSize: '0.9rem', color: 'gray' }} />
                      </Tooltip>
                      <Typography variant='body2'>{item.nread}</Typography>
                    </Stack>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Tooltip title='点赞' arrow>
                        <ThumbUpIcon sx={{ fontSize: '0.9rem', color: 'gray' }} />
                      </Tooltip>
                      <Typography variant='body2'>{item.nstar}</Typography>
                    </Stack>
                    <TimeAgo time={item.send_time} />
                  </Stack>
                }
                secondary={<EllipsisText lines={2}>{item.content}</EllipsisText>}
              />
            </ListItem>
          ))}
        </List>
        {list.length === 0 && (loading ? <Placeholder /> : <Empty />)}
      </Paper>
      {list.length > 0 &&
        <Stack alignItems='center' sx={{ mt: 3 }}>
          <Pagination count={pageCount} color="primary" page={page + 1}
            onChange={(_, newPage) => { setPage(newPage - 1) }}
          />
        </Stack>
      }
      <Footer sx={{ mt: 8 }} />
    </Container>
  )
}

function Placeholder() {
  return (
    <Stack p={2}>
      <Typography variant='h5' width='50%'><Skeleton /></Typography>
      <Typography variant='body2' width='100%'><Skeleton /></Typography>
      <Typography variant='body2' width='100%'><Skeleton /></Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant='h5' width='50%'><Skeleton /></Typography>
      <Typography variant='body2' width='100%'><Skeleton /></Typography>
      <Typography variant='body2' width='100%'><Skeleton /></Typography>
    </Stack>
  )
}

function Empty() {
  return (
    <Stack alignItems='center' p={6} spacing={2}>
      <FitbitIcon sx={{ fontSize: 96, color: '#8882' }} />
      <Typography variant='body2'>没有公告</Typography>
    </Stack>
  )
}
