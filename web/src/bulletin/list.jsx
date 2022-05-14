import { useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import Ellipsis from "~/comp/ellipsis";
import SearchBar from '~/comp/search-bar';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import { get } from '~/lib/rest';
import Banner from '~/comp/banner';

export default function Lists() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(15);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(true);

  useTitle('公告');
  useSetCode(0);

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
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
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, page, rows, keyword, refresh]);

  // 搜索
  const onKeywordChange = value => {
    setPage(0);
    setKeyword(value);
  }

  const onItemClick = item => {
    navigate(`/user/notification/${item.uuid}`);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ my: 4 }}>
      <Toolbar disableGutters>
        <Box sx={{ flex: 1 }}>
          <Link component={RouteLink} to='/'>
            <Banner height={28} />
          </Link>
        </Box>
        <SearchBar value={keyword} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : ''}
        />
      </Toolbar>
      <Typography variant='h5'>公告</Typography>
      <List>
        {list.map(item => (
          <ListItem key={item.uuid} disableGutters>
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
                    {dayjs(item.create_at).fromNow()}
                  </Typography>
                </Stack>
              }
              secondary={<Ellipsis lines={3}>{item.content}</Ellipsis>}
            />
          </ListItem>
        ))}
        {list.length === 0 &&
          <ListItem>
            <ListItemText primary={loading ? '正在查询' : '没有公告'}
              primaryTypographyProps={{ textAlign: 'center', color: 'gray' }}
            />
          </ListItem>
        }
      </List>
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
