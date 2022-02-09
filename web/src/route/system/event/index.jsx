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
import SearchInput from '~/comp/search-input';
import Markdown from '~/comp/markdown';
import titleState from "~/state/title";
import Typography from '@mui/material/Typography';
import { post, put } from '~/rest';

export default function Event() {
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [keyword, setKeyword] = useState([]);
  const [day, setDay] = useState(7);
  const [level, setLevel] = useState(2);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTitle('系统事件'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await post('/system/event/', new URLSearchParams({
          page, rows_per_page: 10, keyword, day, level,
        }));
        if (resp.count > 0) {
          let pages = resp.count / 10;
          if (resp.count % 10 > 0) {
            pages += 1;
          }
          setTotal(parseInt(pages));
        } else {
          setTotal(0);
        }
        setEvents(resp.events || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, page, keyword, day, level]);

  // 搜索
  const onKeywordChange = value => {
    setKeyword(value);
    setPage(0);
  }

  // 展开时更新通知为已读
  const onAccordionChange = async (e, expanded, event) => {
    if (expanded && event.fresh) {
      try {
        await put('/system/event/unfresh', new URLSearchParams({
          uuid: event.uuid,
        }));
        setEvents(events.map(e => {
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

  // 页面改变
  const onPageChange = (e, newPage) => {
    console.log(newPage)
    setPage(newPage - 1);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={loading} onChange={onKeywordChange} />
        <TextField
          select variant='standard' sx={{ ml: 2, minWidth: 100 }}
          value={day} onChange={e => { setDay(e.target.value) }}>
          <MenuItem value={7}>近一周</MenuItem>
          <MenuItem value={30}>近一月</MenuItem>
          <MenuItem value={90}>近三月</MenuItem>
          <MenuItem value={365}>近一年</MenuItem>
          <MenuItem value={365000}>全部</MenuItem>
        </TextField>
        <TextField
          select variant='standard' sx={{ ml: 2, minWidth: 100 }}
          value={level} onChange={e => { setLevel(e.target.value) }}>
          <MenuItem value={0}>待办</MenuItem>
          <MenuItem value={1}>信息</MenuItem>
          <MenuItem value={2}>警告</MenuItem>
          <MenuItem value={3}>错误</MenuItem>
        </TextField>
      </Toolbar>

      <Paper variant='outlined' sx={{ mt: 2 }}>
        {events.map(e => (
          <Accordion key={e.uuid} elevation={0} disableGutters
            onChange={(evt, expanded) => onAccordionChange(evt, expanded, e)} sx={{
            borderBottom: '1px solid #8884',
            '&:before': { display: 'none', },
            '&:last-child': { borderBottom: 0, }
          }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction='row' alignItems='center' spacing={1}>
                <LevelIcon level={e.level} />
                <Typography variant='subtitle1' sx={{
                  fontWeight: e.fresh ? 'bold' : 'normal',
                }}>
                  {e.title}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pl: 6, backgroundColor: theme =>
                theme.palette.mode === 'dark' ? 'black' : 'white',
            }}>
              <Stack sx={{ maxWidth: 660 }} spacing={1}>
                <Typography variant='caption'>
                  时间: {dayjs(e.create_at).format('YY-MM-DD HH:mm:ss')}
                </Typography>
                <Markdown>{e.message}</Markdown>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
      <Stack alignItems='center' sx={{ mt: 2 }}>
        <Pagination count={total} color="primary" page={page + 1}
          onChange={onPageChange}
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
