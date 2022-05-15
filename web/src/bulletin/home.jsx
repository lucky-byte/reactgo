import { useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CampaignIcon from '@mui/icons-material/Campaign';
import FitbitIcon from '@mui/icons-material/Fitbit';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import Ellipsis from "~/comp/ellipsis";
import SearchBar from '~/comp/search-bar';
import useTitle from "~/hook/title";
import { get } from '~/lib/rest';
import Banner from '~/comp/banner';

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
    navigate(`/bulletin/${item.uuid}`);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar disableGutters>
        <Stack direction='row' alignItems='flex-end' spacing={3} sx={{ flex: 1 }}>
          <Link component={RouteLink} to='/'>
            <Banner height={28} />
          </Link>
          <Chip size='small' label='公告' variant='outlined' color='info'
            icon={<CampaignIcon />}
          />
        </Stack>
        <SearchBar value={keyword} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : '搜索...'}
        />
      </Toolbar>
      <List>
        {list.map(item => (
          <ListItem key={item.uuid} divider>
            <ListItemText
              disableTypography
              primary={
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Link underline='hover' sx={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => onItemClick(item)}>
                    <Ellipsis variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {item.title}
                    </Ellipsis>
                  </Link>
                  <Typography variant='caption' sx={{ color: 'gray' }}>
                    {dayjs(item.send_time).fromNow()}
                  </Typography>
                </Stack>
              }
              secondary={<Ellipsis lines={3}>{item.content}</Ellipsis>}
            />
          </ListItem>
        ))}
      </List>
      {list.length === 0 && (loading ? <Placeholder /> : <Empty />)}
      {list.length > 0 &&
        <Stack alignItems='center' sx={{ mt: 2 }}>
          <Pagination count={pageCount} color="primary" page={page + 1}
            onChange={(_, newPage) => { setPage(newPage - 1) }}
          />
        </Stack>
      }
    </Container>
  )
}

function Placeholder() {
  return (
    <Stack mt={2}>
      <Typography variant='h5' width='50%'><Skeleton /></Typography>
      <Typography variant='body2' width='100%'><Skeleton /></Typography>
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
