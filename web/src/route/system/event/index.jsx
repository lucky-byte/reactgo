import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
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
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Pagination from '@mui/material/Pagination';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import SearchInput from '~/comp/search-input';
import Markdown from '~/comp/markdown';
import titleState from "~/state/title";
import Typography from '@mui/material/Typography';
import { post, put } from '~/rest';

dayjs.extend(relativeTime);

export default function Event() {
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [keyword, setKeyword] = useState([]);
  const [days, setDays] = useState(7);
  const [level, setLevel] = useState(0);
  const [fresh, setFresh] = useState('all');
  const [list, setList] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTitle('系统事件'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await post('/system/event/', new URLSearchParams({
          page, rows, keyword, days, level, fresh,
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
        setList(resp.list || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, page, rows, keyword, days, level, fresh]);

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

  // 级别
  const onLevelChange = e => {
    setPage(0);
    setLevel(e.target.value);
  }

  // 状态
  const onFreshChange = e => {
    setPage(0);
    setFresh(e.target.value);
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
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={loading} onChange={onKeywordChange} />
        <TextField
          select variant='standard' sx={{ ml: 2, minWidth: 100 }}
          value={days} onChange={onDaysChange}>
          <MenuItem value={7}>近一周</MenuItem>
          <MenuItem value={30}>近一月</MenuItem>
          <MenuItem value={90}>近三月</MenuItem>
          <MenuItem value={365}>近一年</MenuItem>
          <MenuItem value={365000}>全部</MenuItem>
        </TextField>
        <TextField
          select variant='standard' sx={{ ml: 2, minWidth: 100 }}
          value={level} onChange={onLevelChange}>
          <MenuItem value={0}>全部级别</MenuItem>
          <MenuItem value={1}>信息</MenuItem>
          <MenuItem value={2}>警告</MenuItem>
          <MenuItem value={3}>错误</MenuItem>
        </TextField>
        <TextField
          select variant='standard' sx={{ ml: 2, minWidth: 100 }}
          value={fresh} onChange={onFreshChange}>
          <MenuItem value='all'>全部状态</MenuItem>
          <MenuItem value='false'>已读</MenuItem>
          <MenuItem value='true'>未读</MenuItem>
        </TextField>
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
              <Stack direction='row' alignItems='center' spacing={1}
                sx={{ flex: 1, mr: 2 }}>
                <LevelIcon level={e.level} />
                <Typography variant='subtitle1' sx={{
                  flex: 1, fontWeight: e.fresh ? 'bold' : 'normal',
                }}>
                  {e.title}
                </Typography>
                <Typography variant='caption' sx={{ color: 'gray' }}>
                  {e.timeAgo || dayjs(e.create_at).fromNow()}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pl: 6, backgroundColor: theme =>
                theme.palette.mode === 'dark' ? 'black' : 'white',
            }}>
              <Stack spacing={1}>
                <Markdown>{e.message}</Markdown>
              </Stack>
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
