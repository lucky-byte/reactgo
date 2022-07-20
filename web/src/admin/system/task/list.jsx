import { useEffect, useState } from 'react';
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import RestoreIcon from '@mui/icons-material/Restore';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SettingsIcon from '@mui/icons-material/Settings';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import dayjs from 'dayjs';
import progressState from "~/state/progress";
import SearchInput from '~/comp/search-input';
import { useSecretCode } from '~/comp/secretcode';
import useTitle from "~/hook/title";
import usePageData from '~/hook/pagedata';
import { useSetCode } from "~/state/code";
import { post, del, get } from '~/lib/rest';

export default function List() {
  const navigate = useNavigate();
  const [progress, setProgress] = useRecoilState(progressState);
  const [pageData, setPageData] = usePageData();
  const { enqueueSnackbar } = useSnackbar();
  const [count, setCount] = useState(0);
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(pageData('rowsPerPage') || 10);
  const [type, setType] = useState('');
  const [refresh, setRefresh] = useState(true);

  useTitle('定时任务');
  useSetCode(9050);

  const requestRefresh = () => { setRefresh(!refresh); }

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const query = new URLSearchParams({ page, rows, keyword, type });
        const resp = await get('/system/task/list?' + query.toString());
        setCount(resp.count || 0);
        setList(resp.list || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [ enqueueSnackbar, setProgress, page, rows, keyword, type, refresh ]);

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

    setRows(rows);
    setPage(0);
    setPageData('rowsPerPage', rows);
  }

  const onTypeChange = (e, v) => {
    if (v !== null) {
      setType(v);
      setPage(0);
    }
  }

  return (
    <Container as='main' maxWidth='lg' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <Stack direction='row' spacing={1} flex={1}>
          <SearchInput isLoading={progress} onChange={onKeywordChange}
            placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : '搜索...'}
            sx={{ minWidth: 300 }}
          />
          <ToggleButtonGroup exclusive size='small' color='primary' aria-label="类型"
            value={type} onChange={onTypeChange}>
            <ToggleButton value='' sx={{ py: '4px' }}>全部</ToggleButton>
            <ToggleButton value='1' sx={{ py: '4px' }}>函数</ToggleButton>
            <ToggleButton value='2' sx={{ py: '4px' }}>命令</ToggleButton>
          </ToggleButtonGroup>
          <Stack flex={1} direction='row' spacing={1} justifyContent='flex-end'>
            <Button variant='outlined' size='small' startIcon={<AddIcon />}
              onClick={() => { navigate('add') }}>
              添加
            </Button>
            <Button variant='outlined' size='small' color='info'
              startIcon={<SettingsIcon />}
              onClick={() => { navigate('setting') }}>
              配置
            </Button>
            <Button variant='outlined' size='small' color='warning'
              startIcon={<MonitorHeartIcon />}
              onClick={() => { navigate('entries') }}>
              诊断
            </Button>
          </Stack>
        </Stack>
      </Toolbar>
      <Table size='medium'>
        <TableHead>
          <TableRow sx={{ whiteSpace: 'nowrap' }}>
            <TableCell align='center'>名称</TableCell>
            <TableCell align='center'>CRON</TableCell>
            <TableCell align='center'>类型</TableCell>
            <TableCell align='center'>路径</TableCell>
            <TableCell align='center'>执行次数</TableCell>
            <TableCell align='center'>最后执行时间</TableCell>
            <TableCell as='td' align='right' colSpan={2} padding='checkbox' />
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map(t => (
            <TableRow hover key={t.uuid} disabled={t.disabled}>
              <TableCell align="center">{t.name}</TableCell>
              <TableCell align="center"><code>{t.cron}</code></TableCell>
              <TableCell align="center">
                {t.type === 1 ? '函数' : '命令'}
              </TableCell>
              <TableCell align="center">{t.path}</TableCell>
              <TableCell align="center">{t.nfire}</TableCell>
              <TableCell align="center">
                {dayjs(t.last_fire).format('YY-MM-DD HH:mm:ss')}
              </TableCell>
              <TableCell align="right" padding='none'>
                {t.disabled &&
                  <BlockIcon color='warning' fontSize='small'
                    sx={{ verticalAlign: 'middle' }}
                  />
                }
              </TableCell>
              <TableCell align="right" padding='checkbox' className='action'>
                <UserMenuIconButton task={t} requestRefresh={requestRefresh} />
              </TableCell>
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
              SelectProps={{ inputProps: { 'aria-label': '每页行数' } }}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </Container>
  )
}

function UserMenuIconButton(props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const secretCode = useSecretCode();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const { task, requestRefresh } = props;

  const onClose = () => {
    setAnchorEl(null);
  };

  // 信息
  const onInfoClick = () => {
    setAnchorEl(null);
    navigate('info', { state: { uuid: task.uuid } });
  };

  // 修改
  const onModifyClick = () => {
    setAnchorEl(null);
    navigate('modify', { state: { uuid: task.uuid } });
  };

  // 立即执行
  const onFireClick = async () => {
    try {
      setAnchorEl(null);

      await confirm({
        description: `确定要立即执行 ${task?.name} 吗？`,
        confirmationText: '立即执行',
        confirmationButtonProps: { color: 'warning' },
      });
      const _audit = `请求立即执行定时任务 ${task.name}`;

      await post('/system/task/fire', new URLSearchParams({
        uuid: task.uuid, _audit,
      }));
      enqueueSnackbar('已提交', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 禁用/启用
  const onDisableClick = async () => {
    try {
      setAnchorEl(null);

      await confirm({
        description: task.disabled ?
          `确定要恢复 ${task?.name} 吗？恢复后该任务将立即添加到调度队列等待执行。`
          :
          `确定要禁用 ${task?.name} 吗？禁用后该任务将从调度队列中移除。`,
        confirmationText: task.disabled ? '恢复' : '禁用',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      const _audit = `${task.disabled ? '启用' : '禁用'} 定时任务 ${task.name}`;

      await post('/system/task/disable', new URLSearchParams({
        uuid: task.uuid, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
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
        description: `确定要删除 ${task?.name} 吗？删除后无法恢复。`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });

      const token = await secretCode();

      const _audit = `删除定时任务 ${task.name}`;

      const params = new URLSearchParams({
        secretcode_token: token, uuid: task.uuid, _audit,
      });
      await del('/system/task/delete?' + params.toString());
      enqueueSnackbar('已删除', { variant: 'success' });
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
        aria-label='菜单'
        aria-controls={open ? '菜单' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={e => { setAnchorEl(e.currentTarget); }}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <MenuItem onClick={onInfoClick}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>详细信息</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onModifyClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>修改</ListItemText>
        </MenuItem>
        <MenuItem disabled={task.disabled} onClick={onFireClick}>
          <ListItemIcon>
            <LocalFireDepartmentIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>立即执行</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled={task.deleted} onClick={onDisableClick}>
          <ListItemIcon>
            {task.disabled ?
              <RestoreIcon fontSize="small" color='warning' />
              :
              <BlockIcon fontSize="small" color='warning' />
            }
          </ListItemIcon>
          {task.disabled ?
            <ListItemText>恢复</ListItemText>
            :
            <ListItemText>禁用</ListItemText>
          }
        </MenuItem>
        <MenuItem disabled={task.deleted} onClick={onDeleteClick}>
          <ListItemIcon>
            <RemoveCircleOutlineIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
