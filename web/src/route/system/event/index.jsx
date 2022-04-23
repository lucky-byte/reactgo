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
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import { get, put } from '~/rest';

// 代码拆分
const Markdown = lazy(() => import('~/comp/markdown'));

export default function Event() {
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

  useTitle('系统事件');
  useSetCode(9040);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const q = new URLSearchParams({ page, rows, keyword, level, fresh });
        const resp = await get('/system/event/?' + q.toString());
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

  // 展开时更新通知为已读
  const onAccordionChange = async (e, expanded, event) => {
    if (expanded && event.fresh) {
      try {
        await put('/system/event/unfresh', new URLSearchParams({
          uuid: event.uuid, _noop: true,
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
            <ToggleButton value='false' aria-label="已读">已读</ToggleButton>
            <ToggleButton value='true' aria-label="未读">
              未读 ({freshCount})
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Toolbar>

      <Paper variant='outlined' sx={{ mt: 0 }}>
        {list.map(e => (
          <Accordion key={e.uuid} elevation={0} disableGutters
            onChange={(evt, expanded) => onAccordionChange(evt, expanded, e)} sx={{
              borderBottom: '1px solid #8884',
              '&:before': { display: 'none', },
              '&:last-child': { borderBottom: 0, }
            }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction='row' alignItems='center' spacing={1} sx={{ flex: 1, mr: 2 }}>
                <LevelIcon level={e.level} />
                <Typography variant='subtitle1' sx={{
                  flex: 1, fontWeight: e.fresh ? 'bold' : 'normal',
                }}>
                  {e.title}
                </Typography>
                {e.fresh && <Chip label='新' size='small' color='info' />}
                <Typography variant='caption' sx={{ color: 'gray' }}>
                  {e.timeAgo || dayjs(e.create_at).fromNow()}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: theme =>
              theme.palette.mode === 'dark' ? 'black' : 'white',
            }}>
              <Markdown>{e.message}</Markdown>
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

// 事件级别图标
function LevelIcon(props) {
  switch (props.level) {
    case 0:
      return <CheckBoxOutlineBlankIcon color='success' />
    case 1:
      return <InfoIcon color='info' />
    case 2:
      return <WarningAmberIcon color='warning' />
    case 3:
      return <ErrorOutlineIcon color='error' />
    default:
      return <HelpOutlineIcon color='disabled' />
  }
}
