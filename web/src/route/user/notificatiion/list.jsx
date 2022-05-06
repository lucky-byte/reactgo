import { useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink } from "react-router-dom";
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
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingIcon from '@mui/icons-material/Settings';
import CampaignIcon from '@mui/icons-material/Campaign';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import Ellipsis from "~/comp/ellipsis";
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import { get } from '~/lib/rest';

export default function Lists() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('0');
  const [status, setStatus] = useState('0');
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useTitle('通知');
  useSetCode(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams({ page, rows, keyword, type, status });
        const resp = await get('/user/notification/?' + query.toString());
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
        setUnread(resp.unread || 0);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, page, rows, keyword, type, status]);

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

  // 类型
  const onTypeChange = (e, v) => {
    if (v !== null) {
      setType(v);
      setPage(0);
    }
  }

  // 状态
  const onStatusChange = (e, v) => {
    if (v !== null) {
      setStatus(v);
      setPage(0);
    }
  }

  const onItemClick = item => {
    navigate(`/user/notification/${item.uuid}`, { state: { status: item.status } });
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={loading} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : ''}
          sx={{ minWidth: 300 }}
        />
        <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ flex: 1 }}>
          <ToggleButtonGroup exclusive size='small' color='primary' aria-label="状态"
            value={status} onChange={onStatusChange}>
            <ToggleButton value='0' aria-label="全部">全部</ToggleButton>
            <ToggleButton value='1' aria-label="未读">未读 ({unread})</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup exclusive size='small' color='primary' aria-label="类型"
            value={type} onChange={onTypeChange}>
            <ToggleButton value='0' aria-label="全部">全部</ToggleButton>
            <ToggleButton value='1' aria-label="警告">通知</ToggleButton>
            <ToggleButton value='2' aria-label="信息">公告</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <IconButton color='primary' edge='end' sx={{ ml: 1 }}
          LinkComponent={RouteLink} to='setting'>
          <SettingIcon />
        </IconButton>
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
              disableTypography
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
          onChange={(_, newPage) => { setPage(newPage - 1) }}
        />
      </Stack>
    </Container>
  )
}
