import { lazy, useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import Menu from '@mui/material/Menu';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import { useSecretCode } from '~/comp/secretcode';
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import { post, del, get } from '~/rest';
import { IconButton, Tooltip } from '@mui/material';

// 代码拆分
const Markdown = lazy(() => import('~/comp/markdown'));

export default function List() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState([]);
  const [days, setDays] = useState(7);
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(true);

  useTitle('系统公告');

  // 获取列表数据
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams({ page, rows, keyword, days });
        const resp = await get('/system/bulletin/?' + query.toString());
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
  }, [enqueueSnackbar, page, rows, keyword, days, refresh]);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      let outdated = false;

      const newlist = list.map(item => {
        if (item.status === 2 && dayjs().isAfter(item.send_time)) {
          outdated = true;
        }
        item.timeAgo = dayjs(item.create_at).fromNow();
        return item;
      });
      if (outdated) {
        setRefresh(!refresh);
      } else {
        setList(newlist);
      }
    }, 1000);
    return () => clearInterval(timer)
  }, [list, refresh]);

  // 搜索
  const onKeywordChange = value => {
    setPage(0);
    setKeyword(value);
  }

  // 时间段
  const onDaysChange = e => {
    setPage(0);
    setDays(e.target.value);
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
        <SearchInput isLoading={loading} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : ''}
          sx={{ minWidth: 300 }}
        />
        <TextField
          select variant='standard' sx={{ ml: 2, minWidth: 100 }}
          value={days} onChange={onDaysChange}>
          <MenuItem value={7}>近一周</MenuItem>
          <MenuItem value={30}>近一月</MenuItem>
          <MenuItem value={90}>近三月</MenuItem>
          <MenuItem value={365}>近一年</MenuItem>
          <MenuItem value={365000}>不限时间</MenuItem>
        </TextField>
        <Typography textAlign='right' sx={{ flex: 1 }} variant='caption' />
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
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction='row' alignItems='center' spacing={1} sx={{ flex: 1, mr: 1 }}>
                <Typography variant='subtitle1' sx={{ flex: 1 }}
                  onClick={() => onAccordionTitleClick(b)}>
                  {b.title}
                </Typography>
                {b.status === 1 && <Chip label="草稿" size='small' />}
                {b.status === 2 &&
                  <Tooltip title={`${dayjs(b.send_time).format('LLL')} 发布`}>
                    <Chip
                      icon={<ScheduleIcon />}
                      label={`${dayjs().to(b.send_time, true)}后发布`}
                      size='small' color='info' variant='outlined'
                    />
                  </Tooltip>
                }
                {b.status === 4 &&
                  <Chip label="失败" color='error' size='small' variant='outlined' />
                }
                <Typography variant='caption' sx={{ color: 'gray' }}
                  onClick={() => onAccordionTitleClick(b)}>
                  {b.timeAgo || dayjs(b.create_at).fromNow()}
                </Typography>
                <MenuIcon bulletin={b} requestRefresh={() => setRefresh(!refresh)} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{
                minHeight: 80,
                maxHeight: 300,
                overflow: 'auto',
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'black' : 'white',
              }}>
              <Markdown sx={{ flex: 1 }}>{b.content}</Markdown>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
      <Stack alignItems='center' sx={{ mt: 2 }}>
        <Pagination count={pageCount} color="primary" page={page + 1}
          onChange={(e, newPage) => { setPage(newPage - 1) }}
        />
      </Stack>
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
        description: `确定要删除该记录吗？删除后无法恢复!`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });

      const token = await secretCode();

      const params = new URLSearchParams({
        uuid: bulletin.uuid, secretcode_token: token
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
        description: `确定要立即发布吗？`,
        confirmationText: '发布',
        confirmationButtonProps: { color: 'success' },
      });

      await post('/system/bulletin/send', new URLSearchParams({
        uuid: bulletin.uuid,
      }));
      enqueueSnackbar('已发布', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

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
          <ListItemText>立即发布</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

function FullScreenMenuItem(props) {
  const [fullScreenOpen, setFullScreenOpen] = useState(false);

  const { bulletin, closeMenu } = props;

  const contentRef = useRef();
  const print = usePrint(contentRef.current);

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
        <Container maxWidth='md' sx={{ my: 4 }} ref={contentRef}>
          <Typography variant='h4' textAlign='center'>{bulletin.title}</Typography>
          <Typography variant='caption' paragraph textAlign='center'>
            {dayjs(bulletin.create_at).format('LLLL')} by{' '}
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
