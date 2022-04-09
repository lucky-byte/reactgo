import { lazy, useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
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
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import { post, put } from '~/rest';
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
  const [freshCount, setFreshCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useTitle('系统公告');

  // 获取列表数据
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await post('/system/bulletin/', new URLSearchParams({
          page, rows, keyword, days,
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
        setFreshCount(resp.fresh_count || 0);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, page, rows, keyword, days]);

  // 更新时间
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
  const onDaysChange = e => {
    setPage(0);
    setDays(e.target.value);
  }

  // 展开时更新通知为已读
  const onAccordionChange = async (e, expanded, event) => {
    if (expanded && event.fresh) {
      try {
        await put('/system/event/unfresh', new URLSearchParams({
          uuid: event.uuid,
        }));
        setList(list.map(e => {
          if (e.uuid === event.uuid) {
            e.fresh = false;
          }
          return e;
        }));
        setFreshCount(freshCount - 1);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    }
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
          onClick={() => { navigate('add') }}>
          发布公告
        </Button>
      </Toolbar>

      <Paper variant='outlined' sx={{ mt: 0 }}>
        {list.map(b => (
          <Accordion key={b.uuid} elevation={0} disableGutters
            onChange={(evt, expanded) => onAccordionChange(evt, expanded, b)} sx={{
            borderBottom: '1px solid #8884',
            '&:before': { display: 'none', },
            '&:last-child': { borderBottom: 0, }
          }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction='row' alignItems='center' spacing={1}
                sx={{ flex: 1, mr: 2 }}>
                <Typography variant='subtitle1' sx={{
                  flex: 1, fontWeight: b.fresh ? 'bold' : 'normal',
                }}>
                  {b.title}
                </Typography>
                {b.draft && <Chip label="草稿" size='small' />}
                <Typography variant='caption' sx={{ color: 'gray' }}>
                  已读：{b.nreaders}/{b.ntargets}，
                  {b.timeAgo || dayjs(b.create_at).fromNow()}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{
                minHeight: 80,
                maxHeight: 300,
                overflow: 'auto',
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'black' : 'white',
              }}>
              <Stack direction='row' spacing={2}>
                <Markdown sx={{ flex: 1 }}>{b.content}</Markdown>
                <Tools bulletin={b} />
              </Stack>
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

function Tools(props) {
  const [fullScreenOpen, setFullScreenOpen] = useState(false);

  const { bulletin } = props;

  const contentRef = useRef();
  const print = usePrint(contentRef.current);

  const onOpenFullScreen = () => {
    setFullScreenOpen(true);
  }

  const onCloseFullScreen = () => {
    setFullScreenOpen(false);
  }

  return (
    <>
      <Tooltip title='全屏'>
        <Fab size='small' color="primary" aria-label="全屏"
          sx={{ position: 'sticky', top: 0, right: 0 }}
          onClick={onOpenFullScreen}>
          <OpenInFullIcon fontSize='small' />
        </Fab>
      </Tooltip>
      <Dialog onClose={onCloseFullScreen} open={fullScreenOpen} fullScreen
        TransitionComponent={Zoom}>
        <Container maxWidth='md' sx={{ my: 4 }} ref={contentRef}>
          <Typography variant='h4' textAlign='center'>{bulletin.title}</Typography>
          <Markdown>{bulletin.content}</Markdown>
        </Container>
        <Stack direction='row' spacing={2} sx={{ position: 'fixed', top: 10, right: 10 }}>
          <IconButton color='primary' onClick={print}>
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
