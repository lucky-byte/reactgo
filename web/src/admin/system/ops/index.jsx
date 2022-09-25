import { lazy, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
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
import DateInput from "~/comp/date-input";
import EllipsisText from "~/comp/ellipsis-text";
import TimeAgo from '~/comp/timeago';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import { get } from '~/lib/rest';

// 代码拆分
const Markdown = lazy(() => import('~/comp/markdown'));

export default function Ops() {
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState(null);
  const [method, setMethod] = useState('ALL');
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useTitle('操作审计');
  useSetCode(9025);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const d = date ? date.format('L') : '';
        const q = new URLSearchParams({ page, rows, keyword, date: d, method });
        const resp = await get('/system/ops/?' + q.toString());
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
  }, [enqueueSnackbar, page, rows, keyword, date, method]);

  // 搜索
  const onKeywordChange = value => {
    setPage(0);
    setKeyword(value);
  }

  // 日期
  const onDateChange = v => {
    setPage(0);
    setDate(v);
  }

  // 方法
  const onMethodChange = (e, v) => {
    if (v !== null) {
      setMethod(v);
      setPage(0);
    }
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <Stack direction='row' spacing={2}>
          <SearchInput isLoading={loading} onChange={onKeywordChange}
            placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : '搜索...'}
            sx={{ minWidth: 300 }}
          />
          <DateInput
            value={date} onChange={onDateChange} maxDate={dayjs()}
          />
        </Stack>
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

      <Paper variant='outlined' sx={{ mt: 1 }}>
        {list.map(item => (
          <Accordion key={item.uuid} elevation={0} disableGutters
            sx={{
              borderBottom: '1px solid #8884',
              '&:before': { display: 'none', },
              '&:last-child': { borderBottom: 0, }
            }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction='row' alignItems='center' spacing={1} sx={{ flex: 1, mr: 2 }}>
                <Stack sx={{ flex: 1 }}>
                  <EllipsisText variant='subtitle1' lines={1}>{item.audit}</EllipsisText>
                  <Typography variant='body2' color='gray'>{item.url}</Typography>
                </Stack>
                <Chip label={item.method} size='small' variant='outlined' />
                <Chip label={item.user_name || item.userid}
                  size='small' variant='outlined'
                />
                <TimeAgo time={item.create_at} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: theme =>
              theme.palette.mode === 'dark' ? 'black' : 'white',
            }}>
              <Typography variant='body2' align='right' color='gray'>
                {dayjs(item.create_at).format('LL LT')}
              </Typography>
              {item.audit.length > 30 && <Typography>{item.audit}</Typography>}
              <Markdown>{item.body}</Markdown>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
      <Stack alignItems='center' sx={{ mt: 3 }}>
        <Pagination count={pageCount} color="primary" page={page + 1}
          onChange={(e, newPage) => { setPage(newPage - 1)}}
        />
      </Stack>
    </Container>
  )
}
