import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import HistoryIcon from '@mui/icons-material/History';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TablePagination from '@mui/material/TablePagination';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import Markdown from '~/comp/markdown';
import usePageData from '~/hook/pagedata';
import titleState from "~/state/title";
import Typography from '@mui/material/Typography';
import { post, put } from '~/rest';

export default function Event() {
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [pageData, setPageData] = usePageData();
  const [keyword, setKeyword] = useState([]);
  const [day, setDay] = useState(7);
  const [total, setTotal] = useState(0);
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageData('rowsPerPage') || 10);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTitle('系统事件'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await post('/system/event/', new URLSearchParams({
          page, rows_per_page: rowsPerPage, keyword, day,
        }));
        setEvents(resp.events || []);
        setTotal(resp.total || 0);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, page, rowsPerPage, keyword, day]);

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
    setPage(newPage);
  }

  // 每页行数改变
  const onRowsPerPageChange = e => {
    const rows = parseInt(e.target.value, 10);

    setRowsPerPage(rows);
    setPage(0);
    setPageData('rowsPerPage', rows);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={loading} onChange={onKeywordChange} />
        <TextField id='select-time-scope'
          select variant='standard' sx={{ ml: 2 }}
          value={day} onChange={e => { setDay(e.target.value) }}
          InputProps={{
            startAdornment:
              <InputAdornment position="start">
                <Tooltip title='查询时间段'>
                  <HistoryIcon fontSize='small' sx={{ cursor: 'help' }} />
                </Tooltip>
              </InputAdornment>,
          }}>
          <MenuItem value={7}>近一周</MenuItem>
          <MenuItem value={30}>近一月</MenuItem>
          <MenuItem value={90}>近三月</MenuItem>
          <MenuItem value={365}>近一年</MenuItem>
          <MenuItem value={365000}>全部</MenuItem>
        </TextField>
      </Toolbar>

      <Paper variant='outlined' sx={{ mt: 2 }}>
        {events.map(e => (
          <Accordion key={e.uuid} elevation={0} disableGutters
            onChange={(e, expanded) => onAccordionChange(e, expanded, e)} sx={{
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

      {/* <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        colSpan={6}
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        SelectProps={{ inputProps: { 'aria-label': '每页行数' } }}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      /> */}
    </Container>
  )
}

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
