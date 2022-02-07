import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import HistoryIcon from '@mui/icons-material/History';
import MenuItem from '@mui/material/MenuItem';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TablePagination from '@mui/material/TablePagination';
import { useSnackbar } from 'notistack';
import SearchInput from '~/comp/search-input';
import Markdown from '~/comp/markdown';
import usePageData from '~/hook/pagedata';
import titleState from "~/state/title";
import Typography from '@mui/material/Typography';
import { post } from '~/rest';

export default function Notification() {
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [pageData, setPageData] = usePageData();
  const [keyword, setKeyword] = useState([]);
  const [day, setDay] = useState(7);
  const [total, setTotal] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageData('rowsPerPage') || 10);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTitle('事件通知'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await post('/system/notification/', new URLSearchParams({
          page, rows_per_page: rowsPerPage, keyword, day,
        }));
        setNotifications(resp.notifications || []);
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

      {notifications.map(n => (
         <Accordion>
         <AccordionSummary
           expandIcon={<ExpandMoreIcon />}
           aria-controls="panel1a-content"
           id="panel1a-header"
         >
           <Typography>Accordion 1</Typography>
         </AccordionSummary>
         <AccordionDetails>
            <Markdown>{n.message}</Markdown>
         </AccordionDetails>
       </Accordion>
      ))}

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
