import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CampaignIcon from '@mui/icons-material/Campaign';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import Ellipsis from "~/comp/ellipsis";
import useTitle from "~/hook/title";
import { post, put } from '~/rest';

export default function Event() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState('');
  const [level, setLevel] = useState('0');
  const [fresh, setFresh] = useState('all');
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [freshCount, setFreshCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useTitle('通知');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await post('/user/notification/', new URLSearchParams({
          page, rows, keyword, level, fresh,
        }));
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
        // setFreshCount(resp.fresh_count || 0);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, page, rows, keyword, level, fresh]);

  useEffect(() => {
    const timer = setInterval(() => {
      setList(list.map(e => {
        e.timeAgo = dayjs(e.create_at).fromNow();
        return e;
      }));
    }, 1000);
    return () => clearInterval(timer)
  }, [list]);

  // 搜索
  const onKeywordChange = value => {
    setPage(0);
    setKeyword(value);
  }

  // 时间段
  // const onDaysChange = e => {
  //   setPage(0);
  //   setDays(e.target.value);
  // }

  // 级别
  const onLevelChange = (e, v) => {
    if (v !== null) {
      setLevel(v);
      setPage(0);
    }
  }

  // 状态
  const onFreshChange = (e, v) => {
    if (v !== null) {
      setFresh(v);
      setPage(0);
    }
  }

  const onItemClick = item => {
    navigate(`/user/notification/item/${item.uuid}`);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={loading} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : ''}
          sx={{ minWidth: 300 }}
        />
        <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ flex: 1 }}>
          <ToggleButtonGroup exclusive size='small' color='primary' aria-label="级别"
            value={level} onChange={onLevelChange}>
            <ToggleButton value='0' aria-label="全部">全部</ToggleButton>
            <ToggleButton value='1' aria-label="信息">信息</ToggleButton>
            <ToggleButton value='2' aria-label="警告">警告</ToggleButton>
            <ToggleButton value='3' aria-label="错误">错误</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup exclusive size='small' color='primary' aria-label="状态"
            value={fresh} onChange={onFreshChange}>
            <ToggleButton value='all' aria-label="全部">全部</ToggleButton>
            <ToggleButton value='false' aria-label="全部">已读</ToggleButton>
            <ToggleButton value='true' aria-label="全部">
              未读 ({freshCount})
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Toolbar>

      <List>
        {list.map(item => (
          <ListItemButton key={item.uuid} alignItems="flex-start"
            onClick={() => onItemClick(item)}>
            <ListItemIcon>
              <Badge variant='dot' color='secondary' invisible={item.status !== 1}>
              {item.type === 1 && <NotificationsIcon color="success" />}
              {item.type === 2 && <CampaignIcon color="info" />}
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Ellipsis variant="subtitle1" sx={{ flex: 1, fontWeight: 'bold' }}>
                    {item.title}
                  </Ellipsis>
                  <Typography variant='caption' sx={{ color: 'gray' }}>
                    {item.timeAgo || dayjs(item.create_at).fromNow()}
                  </Typography>
                </Stack>
              }
              secondary={<Ellipsis lines={3}>{item.content}</Ellipsis>}
            />
          </ListItemButton>
        ))}
      </List>
      <Stack alignItems='center' sx={{ mt: 2 }}>
        <Pagination count={pageCount} color="primary" page={page + 1}
          onChange={(e, newPage) => { setPage(newPage - 1)}}
        />
      </Stack>
    </Container>
  )
}
