import { useEffect, useState } from 'react';
import Container from "@mui/material/Container";
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import OutlinedPaper from '~/comp/outlined-paper';
import useTitle from "~/hook/title";
import usePageData from '~/hook/pagedata';
import { get } from '~/rest';
import { geo } from '~/lib/geo';

export default function History() {
  const { enqueueSnackbar } = useSnackbar();
  const [pageData, setPageData] = usePageData();
  const [keyword, setKeyword] = useState([]);
  const [date, setDate] = useState(null);
  const [count, setCount] = useState(0);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(pageData('rowsPerPage') || 10);
  const [loading, setLoading] = useState(false);

  useTitle('登录历史');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const d = date ? date.format('L') : '';
        const q = new URLSearchParams({ page, rows, keyword, date: d });
        const resp = await get('/system/history/?' + q.toString());
        setList(resp.list || []);
        setCount(resp.count || 0);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, page, rows, keyword, date]);

  // 搜索
  const onKeywordChange = value => {
    setKeyword(value);
    setPage(0);
  }

  // 日期
  const onDateChange = v => {
    setPage(0);
    setDate(v);
  }

  // 页面改变
  const onPageChange = (e, newPage) => {
    setPage(newPage);
  }

  // 每页行数改变
  const onRowsPerPageChange = e => {
    const rows = parseInt(e.target.value, 10);

    setRows(rows);
    setPage(0);
    setPageData('rowsPerPage', rows);
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={loading} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : ''}
          sx={{ minWidth: 300 }}
        />
        <DatePicker
          value={date} onChange={onDateChange}
          inputFormat='MM/DD/YYYY'
          maxDate={dayjs()}
          renderInput={props => (
            <TextField {...props} variant='standard' sx={{ ml: 2, width: 180 }} />
          )}
        />
      </Toolbar>
      <TableContainer component={OutlinedPaper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">登录名</TableCell>
              <TableCell align="center">姓名</TableCell>
              <TableCell align="center">设备</TableCell>
              <TableCell align="center">信任</TableCell>
              <TableCell align="center">位置</TableCell>
              <TableCell align="center">登录时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell align="center">{row.userid}</TableCell>
                <TableCell align="center">{row.name}</TableCell>
                <TableCell align="center">{row.browser} on {row.os}</TableCell>
                <TableCell align="center" padding='none'>
                  {row.trust ?
                    <CheckIcon fontSize='small' sx={{ verticalAlign: 'middle' }} /> :
                    <CloseIcon fontSize='small' sx={{ verticalAlign: 'middle' }} />
                  }
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={row.ip} arrow placement='left'>
                    <Typography variant='body2' sx={{ cursor: 'default' }}>
                      {geo(row) || row.ip}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={dayjs(row.create_at).format('L LT')} arrow
                    placement='right'>
                    <Typography variant='body2' sx={{ cursor: 'default' }}>
                      {dayjs(row.create_at).fromNow()}
                    </Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                colSpan={6}
                count={count}
                rowsPerPage={rows}
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
