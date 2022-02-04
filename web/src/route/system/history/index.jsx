import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import Container from "@mui/material/Container";
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import HistoryIcon from '@mui/icons-material/History';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import OutlinedPaper from '~/comp/outlined-paper';
import titleState from "~/state/title";
import usePageData from '~/hook/pagedata';
import { post } from '~/rest';

export default function History() {
  const setTitle = useSetRecoilState(titleState);
  const { enqueueSnackbar } = useSnackbar();
  const [pageData, setPageData] = usePageData();
  const [keyword, setKeyword] = useState([]);
  const [day, setDay] = useState(7);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageData('rowsPerPage') || 10);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTitle('登录历史'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await post('/system/history/', new URLSearchParams({
          page, rows_per_page: rowsPerPage, keyword, day,
        }));
        setHistory(resp.history || []);
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
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={loading} onChange={onKeywordChange} />
        <TextField select variant='standard' sx={{ ml: 2 }}
          value={day} onChange={e => { setDay(e.target.value)}}
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
      <TableContainer component={OutlinedPaper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">登录时间</TableCell>
              <TableCell align="center">登录名</TableCell>
              <TableCell align="center">姓名</TableCell>
              <TableCell align="center">设备</TableCell>
              <TableCell align="center">IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell align="center">
                  {dayjs(row.create_at).format('YY/MM/DD HH:mm:ss')}
                </TableCell>
                <TableCell align="center">{row.userid}</TableCell>
                <TableCell align="center">{row.name}</TableCell>
                <TableCell align="center">{row.browser} on {row.os}</TableCell>
                <TableCell align="center">{row.ip} {row.city}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                colSpan={6}
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{ inputProps: { 'aria-label': '每页行数' } }}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Container>
  )
}
