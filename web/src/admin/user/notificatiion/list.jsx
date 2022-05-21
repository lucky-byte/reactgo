import { useEffect, useState } from 'react';
import { useNavigate, Link as RouteLink } from "react-router-dom";
import { useSetRecoilState } from 'recoil';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingIcon from '@mui/icons-material/Settings';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CampaignIcon from '@mui/icons-material/Campaign';
import Pagination from '@mui/material/Pagination';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import SearchInput from '~/comp/search-input';
import EllipsisText from "~/comp/ellipsis-text";
import TimeAgo from '~/comp/timeago';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import { notificationOutdatedState } from "~/state/notification";
import { get, del, put } from '~/lib/rest';

export default function Lists() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const setNotificationOutdated = useSetRecoilState(notificationOutdatedState);
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
  const [refresh, setRefresh] = useState(true);

  useTitle('通知');
  useSetCode(0);

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
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
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, page, rows, keyword, type, status, refresh]);

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

  // 全部删除
  const onClearClick = async () => {
    try {
      await confirm({
        description: '确定要删除全部通知吗？该操作不可撤销，数据将被永久删除，且无法恢复！',
        confirmationText: '删除全部通知',
        confirmationButtonProps: { color: 'error' },
      });
      await put('/user/notification/clear');

      enqueueSnackbar('删除成功', { variant: 'success' });
      setNotificationOutdated(true);
      setRefresh(true);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 单个删除
  const onDeleteClick = async item => {
    try {
      await confirm({
        description: '确定要删除该通知吗？该操作不可撤销，删除后无法恢复！',
        confirmationText: '确定',
        confirmationButtonProps: { color: 'warning' },
      });
      await del('/user/notification/' + item.uuid);

      enqueueSnackbar('删除成功', { variant: 'success' });
      setNotificationOutdated(true);
      setRefresh(true);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  const onItemClick = item => {
    navigate(`/user/notification/${item.uuid}`);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={loading} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : '搜索...'}
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
          <Stack direction='row' spacing={1}>
            <Tooltip title='设置' arrow>
              <IconButton color='primary' LinkComponent={RouteLink} to='setting'>
                <SettingIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title='全部删除' arrow>
              <IconButton color='error' edge='end' onClick={onClearClick}>
                <DeleteSweepIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Toolbar>

      <List>
        {list.map(item => (
          <ListItem key={item.uuid} alignItems="flex-start">
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
                  <Link underline='hover' sx={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => onItemClick(item)}>
                    <EllipsisText variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {item.title}
                    </EllipsisText>
                  </Link>
                  <Button size='small' color='error' onClick={() => onDeleteClick(item)}>
                    删除
                  </Button>
                  <TimeAgo time={item.create_at} />
                </Stack>
              }
              secondary={<EllipsisText lines={3}>{item.content}</EllipsisText>}
            />
          </ListItem>
        ))}
        {list.length === 0 &&
          <ListItem>
            <ListItemText primary={loading ? '正在查询' : '没有通知'}
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
