import { lazy, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import useTitle from "~/hook/title";
import { post, put } from '~/rest';

// 代码拆分
const Markdown = lazy(() => import('~/comp/markdown'));

export default function Ops() {
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState('');
  const [days, setDays] = useState(7);
  const [method, setMethod] = useState('ALL');
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [freshCount, setFreshCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useTitle('操作记录');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await post('/system/ops/', new URLSearchParams({
          page, rows, keyword, days, method,
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
  }, [enqueueSnackbar, page, rows, keyword, days, method]);

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

  // 方法
  const onMethodChange = (e, v) => {
    if (v !== null) {
      setMethod(v);
      setPage(0);
    }
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

        <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ flex: 1 }}>
          <ToggleButtonGroup exclusive size='small' color='primary' aria-label="级别"
            value={method} onChange={onMethodChange}>
            <ToggleButton value='ALL' aria-label="全部">全部</ToggleButton>
            <ToggleButton value='POST' aria-label="信息">POST</ToggleButton>
            <ToggleButton value='PUT' aria-label="警告">PUT</ToggleButton>
            <ToggleButton value='DELETE' aria-label="错误">DELETE</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Toolbar>

      <Paper variant='outlined' sx={{ mt: 0 }}>
        {list.map(item => (
          <Accordion key={item.uuid} elevation={0} disableGutters
            onChange={(evt, expanded) => onAccordionChange(evt, expanded, item)}
            sx={{
              borderBottom: '1px solid #8884',
              '&:before': { display: 'none', },
              '&:last-child': { borderBottom: 0, }
            }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction='row' alignItems='center' spacing={1} sx={{ flex: 1, mr: 2 }}>
                <Typography variant='subtitle1' sx={{
                  flex: 1, fontWeight: item.fresh ? 'bold' : 'normal',
                }}>
                  {item.user_name || item.userid} {item.method} {item.url}
                </Typography>
                {item.fresh && <Chip label='新' size='small' color='info' />}
                <Typography variant='caption' sx={{ color: 'gray' }}>
                  {dayjs(item.create_at).format('LLLL') + ' '}
                  ({item.timeAgo || dayjs(item.create_at).fromNow()})
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: theme =>
              theme.palette.mode === 'dark' ? 'black' : 'white',
            }}>
              <Markdown>{item.body}</Markdown>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
      <Stack alignItems='center' sx={{ mt: 2 }}>
        <Pagination count={pageCount} color="primary" page={page + 1}
          onChange={(e, newPage) => { setPage(newPage - 1)}}
        />
      </Stack>
    </Container>
  )
}
