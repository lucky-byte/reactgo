import { useEffect, useState, Fragment } from 'react';
import { useSetRecoilState, useRecoilState } from "recoil";
import {
  useNavigate, useLocation, Navigate, Link as RouteLink
} from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Toolbar from '@mui/material/Toolbar';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import SearchInput from '~/comp/search-input';
import OutlinedPaper from "~/comp/outlined-paper";
import progressState from "~/state/progress";
import titleState from "~/state/title";
import usePageData from '~/hook/pagedata';
import { post, put } from '~/rest';

export default function User() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const setTitle = useSetRecoilState(titleState);
  const [progress, setProgress] = useRecoilState(progressState);
  const [pageData, setPageData] = usePageData();
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(pageData('rowsPerPage') || 10);
  const [count, setCount] = useState(0);
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState('');

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useEffect(() => { setTitle('绑定用户'); }, [setTitle]);

  const { node } = location?.state || {};

  // 查询已绑定用户
  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await post('/tree/node/user/', new URLSearchParams({
          node: node?.uuid, page, rows, keyword,
        }));
        setCount(resp.count || 0);
        setList(resp.list || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, node, page, rows, keyword, setProgress]);

  // 搜索
  const onKeywordChange = value => {
    setPage(0);
    setKeyword(value);
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

  // uuid 从上个页面通过 state 传入，如果为空，则可能是直接输入 url 进入该页面
  if (!node?.uuid) {
    return <Navigate to='..' replace />;
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 5 }}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 3 }}>
          <IconButton aria-label='返回' component={RouteLink} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack>
            <Typography variant='h6'>绑定用户</Typography>
            <Typography variant='caption'>
              绑定的用户可以访问节点 <strong>{node?.name}</strong> (包含所有子节点)下的资源
            </Typography>
          </Stack>
        </Stack>
        <Toolbar sx={{ mt: 2 }} disableGutters>
          <SearchInput isLoading={progress} onChange={onKeywordChange} />
          <Typography textAlign='right' sx={{ flex: 1 }} variant='caption' />
          <Add node={node} />
        </Toolbar>
        <TableContainer component={OutlinedPaper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                <TableCell align="right">Protein&nbsp;(g)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map(row => (
                <TableRow key={row.uuid}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="right">{row.protein}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          <TableFooter>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                colSpan={10}
                count={count}
                rowsPerPage={rows}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': '每页行数' }
                }}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
              />
            </TableRow>
          </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}

function Add(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState([]);
  const [force, setForce] = useState(false);
  const loading = open && options.length === 0;

  const { node } = props;

  // 关闭对话框
  const onDialogClose = () => {
    setValue([]);
    setDialogOpen(false);
  }

  // 查询可以选择的用户列表
  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }
    (async () => {
      try {
        const resp = await post('/tree/node/user/candidate', new URLSearchParams({
          node: node?.uuid,
        }));
        if (active) {
          setOptions(resp.list);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
        setOpen(false);
      }
    })();
    return () => { active = false; };
  }, [loading, enqueueSnackbar, node]);

  // 下拉选项关闭时清除选项
  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  // 确定
  const onOK = async () => {
    try {
      if (value.length === 0) {
        return enqueueSnackbar('没有选择用户', { variant: 'warning' });
      }
      const users = value.map(v => v.uuid)

      // 检查冲突
      await put('/tree/node/user/add', new URLSearchParams({
        node: node.uuid, users, force,
      }));
      enqueueSnackbar('添加成功', { variant: 'success' });
      // reload(true);
      onDialogClose();
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <>
      <Button startIcon={<AddIcon />} onClick={() => { setDialogOpen(true) }}>
        添加
      </Button>
      <Dialog onClose={onDialogClose} open={dialogOpen} maxWidth='sm' fullWidth>
        <DialogTitle>添加绑定用户</DialogTitle>
        <DialogContent>
          <Autocomplete sx={{ mt: 2 }} fullWidth multiple size='small'
            handleHomeEndKeys
            disableCloseOnSelect
            value={value}
            onChange={(_, v) => { setValue(v) }}
            open={open}
            onOpen={() => { setOpen(true); }}
            onClose={() => { setOpen(false); }}
            options={options}
            loading={loading}
            isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox size='small' checked={selected} />
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="新用户" placeholder="请选择"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <Fragment>
                      {loading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </Fragment>
                  ),
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onDialogClose}>取消</Button>
          <Button variant='contained' onClick={onOK}>确定</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
