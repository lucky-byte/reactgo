import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import titleState from "../../../state/title";
import progressState from "../../../state/progress";
import SearchInput from '../../../comp/search-input';
import OutlinedPaper from '../../../comp/outlined-paper';
import usePageData from '../../../hook/pagedata';
import { post, del } from '../../../rest';

export default function DevelopList() {
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const [progress, setProgress] = useRecoilState(progressState);
  const [pageData, setPageData] = usePageData();
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState('');
  const [total, setTotal] = useState(0);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageData('rowsPerPage') || 10);
  const [refresh, setRefresh] = useState(true);

  useEffect(() => { setTitle('渠道开发商'); }, [setTitle]);

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await post('/develop/bank/', new URLSearchParams({
          page, rows_per_page: rowsPerPage, keyword,
        }));
        setRecords(resp.develops || []);
        setTotal(resp.total || 0);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, page, rowsPerPage, keyword, setProgress, refresh]);

  // 请求刷新列表
  const requestRefresh = () => { setRefresh(!refresh); }

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
        <SearchInput isLoading={progress} onChange={onKeywordChange} />
        <Typography textAlign='right' sx={{ flex: 1 }} variant='caption' />
        <Button startIcon={<AddIcon />} onClick={() => { navigate('add') }}>
          添加
        </Button>
      </Toolbar>
      <TableContainer component={OutlinedPaper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">姓名</TableCell>
              <TableCell align="center">手机号</TableCell>
              <TableCell align="center">公司</TableCell>
              <TableCell align="center">创建时间</TableCell>
              <TableCell align='right' colSpan={2} padding='checkbox'></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((row, index) => (
              <TableRow key={row.uuid} hover>
                <TableCell align="center">{row.name}</TableCell>
                <TableCell align="center">{row.mobile}</TableCell>
                <TableCell align="center">{row.company}</TableCell>
                <TableCell align="center">
                  {dayjs(row.create_at).format('YY/MM/DD HH:mm:ss')}
                </TableCell>
                <TableCell align="right" padding='none'>
                  {row.deleted &&
                    <RemoveCircleOutlineIcon color='error' fontSize='small'
                      sx={{ verticalAlign: 'middle' }}
                    />
                  }
                  {(row.disabled && !row.deleted) &&
                    <BlockIcon color='warning' fontSize='small'
                      sx={{ verticalAlign: 'middle' }}
                    />
                  }
                </TableCell>
                <TableCell align="right" padding='checkbox'>
                  <MenuIconButton develop={row} requestRefresh={requestRefresh} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                colSpan={10}
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

function MenuIconButton(props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const { develop, requestRefresh } = props;

  const onClose = () => {
    setAnchorEl(null);
  };

  // 用户资料
  const onProfileClick = () => {
    setAnchorEl(null);
    navigate('profile', { state: { uuid: develop.uuid } });
  };

  // 修改资料
  const onInfoClick = () => {
    setAnchorEl(null);
    navigate('info', { state: { uuid: develop.uuid } });
  };

  // 禁用/启用
  const onDisableClick = async () => {
    try {
      setAnchorEl(null);

      await confirm({
        description: develop.disabled ?
          `确定要恢复该开发商吗？恢复后该开发商可正常使用。`
          :
          `确定要禁用该开发商吗？禁用后该开发商不可以继续使用，直到恢复为止，历史数据不受影响。`,
        confirmationText: develop.disabled ? '恢复' : '禁用',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      await post('/develop/bank/disable',
        new URLSearchParams({ uuid: develop.uuid })
      );
      enqueueSnackbar('开发商状态已更新成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 删除
  const onDeleteClick = async () => {
    try {
      setAnchorEl(null);

      await confirm({
        description: '确定要删除该开发商吗？删除后不能恢复，历史数据不受影响。',
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });
      const params = new URLSearchParams({ uuid: develop.uuid });
      await del('/develop/bank/delete?' + params.toString());
      enqueueSnackbar('开发商已被删除', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <>
      <IconButton color='primary'
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={e => { setAnchorEl(e.currentTarget); }}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <MenuItem onClick={onProfileClick}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>详细资料</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled={develop.disabled || develop.deleted} onClick={onInfoClick}>
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>修改资料</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled={develop.deleted} onClick={onDisableClick}>
          <ListItemIcon>
            <BlockIcon fontSize="small" color='warning' />
          </ListItemIcon>
          {develop.disabled ?
            <ListItemText>恢复</ListItemText>
            :
            <ListItemText>禁用</ListItemText>
          }
        </MenuItem>
        <MenuItem disabled={develop.deleted} onClick={onDeleteClick}>
          <ListItemIcon>
            <RemoveCircleOutlineIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
