import { lazy, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Zoom from '@mui/material/Zoom';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import UndoIcon from '@mui/icons-material/Undo';
import CloseIcon from '@mui/icons-material/Close';
import NotificationIcon from '@mui/icons-material/Notifications';
import PrintIcon from '@mui/icons-material/Print';
import Menu from '@mui/material/Menu';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import { useSecretCode } from '~/comp/secretcode';
import { useSetCode } from "~/state/code";
import DateInput from "~/comp/date-input";
import EllipsisText from "~/comp/ellipsis-text";
import TimeAgo from '~/comp/timeago';
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import { post, del, get } from '~/lib/rest';

// 代码拆分
const Markdown = lazy(() => import('~/comp/markdown'));

export default function Home() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState([]);
  const [date, setDate] = useState(null);
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(true);

  useTitle('系统公告');
  useSetCode(9070);

  // 获取列表数据
  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
          setLoading(true);

          const d = date ? date.format('L') : '';
          const q = new URLSearchParams({ page, rows, keyword, date: d });
          const resp = await get('/system/bulletin/?' + q.toString());
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
  }, [enqueueSnackbar, page, rows, keyword, date, refresh]);

  // 检查是否有定时发布到期的记录，如果有则更新列表
  useEffect(() => {
    const timer = setInterval(() => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].status === 2 && dayjs().isAfter(list[i].send_time)) {
          return setRefresh(true);
        }
      }
    }, 1000);
    return () => clearInterval(timer)
  }, [list]);

  // 搜索
  const onKeywordChange = value => {
    setPage(0);
    setKeyword(value);
    setRefresh(true);
  }

  // 日期
  const onDateChange = v => {
    setPage(0);
    setDate(v);
    setRefresh(true);
  }

  // 点击标题展开
  const onAccordionTitleClick = bulletin => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].uuid === bulletin.uuid) {
        list[i]._expanded = !list[i]._expanded;
        break;
      }
    }
    setList([...list]);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <Stack direction='row' spacing={2} flex={1}>
          <SearchInput isLoading={loading} onChange={onKeywordChange}
            placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : '搜索...'}
            sx={{ minWidth: 300 }}
          />
          <DateInput
            value={date} onChange={onDateChange} maxDate={dayjs()}
          />
        </Stack>
        <Button variant='outlined' size='small' startIcon={<AddIcon />}
          onClick={() => { navigate('edit') }}>
          发布公告
        </Button>
      </Toolbar>

      <Paper variant='outlined' sx={{ mt: 0 }}>
        {list.map(b => (
          <Accordion key={b.uuid} elevation={0} disableGutters
            expanded={b._expanded || false} sx={{
              borderBottom: '1px solid #8884',
              '&:before': { display: 'none', },
              '&:last-child': { borderBottom: 0, }
            }}>
            <AccordionSummary>
              <Stack direction='row' alignItems='center' spacing={1} sx={{ flex: 1 }}>
                <EllipsisText variant='subtitle1' sx={{ flex: 1 }}
                  onClick={() => onAccordionTitleClick(b)}>
                  {b.title}
                </EllipsisText>
                {b.status === 1 &&
                  <Chip label="草稿" size='small' color='warning' variant='outlined' />
                }
                {b.status === 2 &&
                  <Tooltip title={`${dayjs(b.send_time).format('LL dddd HH:mm:ss')} 发布`}>
                    <Chip
                      icon={<ScheduleIcon />}
                      label={`${dayjs().to(b.send_time, true)}后发布`}
                      size='small' color='info' variant='outlined'
                    />
                  </Tooltip>
                }
                {b.status === 3 && b.is_public && (
                  <>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <VisibilityIcon sx={{ fontSize: '0.9rem', color: 'gray' }} />
                      <Typography variant='body2'>{b.nread}</Typography>
                    </Stack>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <ThumbUpIcon sx={{ fontSize: '0.9rem', color: 'gray' }} />
                      <Typography variant='body2'>{b.nstar}</Typography>
                    </Stack>
                  </>
                )}
                {b.status === 4 &&
                  <Chip label="失败" color='error' size='small' variant='outlined' />
                }
                {b.is_public &&
                  <Chip label="公开" color='success' size='small' variant='outlined' />
                }
                {b.is_notify && <NotificationIcon fontSize='small' color='success' />}
                <TimeAgo time={b.create_at} />
                <MenuIcon bulletin={b} requestRefresh={() => setRefresh(true)} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{
                minHeight: 80,
                maxHeight: 300,
                overflow: 'auto',
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'black' : 'white',
              }}>
              <Markdown>{b.content}</Markdown>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
      {list.length === 0 && (loading ?
        <Typography align='center' sx={{ m: 6 }} color='gray'>查询中</Typography>
        :
        <Typography align='center' sx={{ m: 6 }} color='gray'>没有公告</Typography>
      )}
      {list.length > 0 &&
        <Stack alignItems='center' sx={{ mt: 3 }}>
          <Pagination count={pageCount} color="primary" page={page + 1}
            onChange={(e, newPage) => { setPage(newPage - 1) }}
          />
        </Stack>
      }
    </Container>
  )
}

function MenuIcon(props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const secretCode = useSecretCode();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const { bulletin, requestRefresh } = props;

  const onOpenClick = e => {
    setAnchorEl(e.currentTarget);
  }

  const onClose = () => {
    setAnchorEl(null);
  };

  // 编辑
  const onEditClick = async () => {
    navigate('edit', { state: { bulletin: bulletin }})
  };

  // 删除
  const onDeleteClick = async () => {
    try {
      onClose();

      await confirm({
        description: `确定要删除吗？删除后无法恢复!`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });
      const _audit = `删除公告 ${bulletin.title}`;

      const token = await secretCode();

      const params = new URLSearchParams({
        uuid: bulletin.uuid, secretcode_token: token, _audit,
      });
      await del('/system/bulletin/del?' + params.toString());

      enqueueSnackbar('删除成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  };

  // 立即发布
  const onSendNowClick = async () => {
    try {
      onClose();

      await confirm({
        description: `确定要发布吗？这将会立即发布该公告，即使设置了发布时间也会被忽略，` +
          '如果需要定时发布，请进入编辑页面内发布',
        confirmationText: '发布',
        confirmationButtonProps: { color: 'success' },
      });
      const _audit = `发布公告 ${bulletin.title}`;

      await post('/system/bulletin/send', new URLSearchParams({
        uuid: bulletin.uuid, _audit,
      }));
      enqueueSnackbar('已发布', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 撤销
  const onRevokeClick = async () => {
    try {
      onClose();

      await confirm({
        description: `确定要撤回吗？这将会使该公告变为草稿状态，同时从用户通知列表中删除该公告`,
        confirmationText: '撤回',
        confirmationButtonProps: { color: 'warning' },
      });
      const _audit = `撤回公告 ${bulletin.title}`;

      const token = await secretCode();

      await post('/system/bulletin/revoke', new URLSearchParams({
        uuid: bulletin.uuid, secretcode_token: token, _audit,
      }));

      enqueueSnackbar('撤回成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  };

  return (
    <>
      <IconButton
        size='small'
        aria-label='菜单'
        aria-controls={open ? '菜单' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={onOpenClick}>
        <MoreVertIcon fontSize='small' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <FullScreenMenuItem bulletin={bulletin} closeMenu={onClose} />
        <MenuItem onClick={onEditClick} disabled={bulletin.status === 3}>
          <ListItemIcon>
            <EditIcon fontSize="small" color='primary' />
          </ListItemIcon>
          <ListItemText>编辑</ListItemText>
        </MenuItem>
        <MenuItem onClick={onDeleteClick} disabled={bulletin.status === 3}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onSendNowClick} disabled={bulletin.status === 3}>
          <ListItemIcon>
            <SendIcon fontSize="small" color='success' />
          </ListItemIcon>
          <ListItemText>发布</ListItemText>
        </MenuItem>
        <MenuItem onClick={onRevokeClick} disabled={bulletin.status !== 3}>
          <ListItemIcon>
            <UndoIcon fontSize="small" color='warning' />
          </ListItemIcon>
          <ListItemText>撤回</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

function FullScreenMenuItem(props) {
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [printNode, setPrintNode] = useState(null);

  const { bulletin, closeMenu } = props;

  const print = usePrint(printNode);

  const onOpenFullScreen = () => {
    setFullScreenOpen(true);
  }

  const onCloseFullScreen = () => {
    closeMenu();
    setFullScreenOpen(false);
  }

  return (
    <>
      <MenuItem onClick={onOpenFullScreen}>
        <ListItemIcon>
          <OpenInNewIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>查看</ListItemText>
      </MenuItem>
      <Dialog onClose={onCloseFullScreen} open={fullScreenOpen} fullScreen
        TransitionComponent={Zoom}>
        <Container maxWidth='md' sx={{ my: 4 }} ref={setPrintNode}>
          <Typography variant='h4' textAlign='center'>{bulletin.title}</Typography>
          <Typography variant='caption' paragraph textAlign='center'>
            {dayjs(bulletin.create_at).format('LL dddd HH:mm:ss')} by{' '}
            {bulletin.user_name || bulletin.userid}
          </Typography>
          <Markdown>{bulletin.content}</Markdown>
        </Container>
        <Stack direction='row' spacing={2} sx={{ position: 'fixed', top: 10, right: 10 }}>
          <IconButton onClick={print}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onCloseFullScreen}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Dialog>
    </>
  )
}
