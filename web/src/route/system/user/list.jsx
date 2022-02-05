import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import SecurityIcon from '@mui/icons-material/Security';
import Button from '@mui/material/Button';
import TableContainer from '@mui/material/TableContainer';
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
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import KeyIcon from '@mui/icons-material/Key';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import dayjs from 'dayjs';
import titleState from "~/state/title";
import userState from "~/state/user";
import progressState from "~/state/progress";
import SearchInput from '~/comp/search-input';
import OutlinedPaper from '~/comp/outlined-paper';
import { useSecretCode } from '~/comp/secretcode';
import usePageData from '~/hook/pagedata';
import { post, del, get } from '~/rest';

export default function UserList() {
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const [progress, setProgress] = useRecoilState(progressState);
  const [pageData, setPageData] = usePageData();
  const { enqueueSnackbar } = useSnackbar();
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [acls, setAcls] = useState([]);
  const [acl, setAcl] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageData('rowsPerPage') || 10);
  const [refresh, setRefresh] = useState(true);

  useEffect(() => { setTitle('用户管理'); }, [setTitle]);

  const requestRefresh = () => { setRefresh(!refresh); }

  useEffect(() => {
    (async () => {
      try {
        const resp1 = await get('/system/acl/');
        setAcls(resp1.acls || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [ enqueueSnackbar ]);

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await post('/system/user/list', new URLSearchParams({
          page, rows_per_page: rowsPerPage, keyword, acl,
        }));
        setTotal(resp.total || 0);
        setUsers(resp.users || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [ enqueueSnackbar, setProgress, page, rowsPerPage, keyword, acl, refresh ]);

  // 搜索
  const onKeywordChange = value => {
    setKeyword(value);
    setPage(0);
  }

  const onAclChange = e => {
    setAcl(e.target.value);
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
        <TextField select variant='standard' sx={{ ml: 2 }}
          value={acl} onChange={onAclChange}
          InputProps={{
            startAdornment:
              <InputAdornment position="start">
                <Tooltip title='通过访问控制筛选'>
                  <SecurityIcon fontSize='small' sx={{
                    cursor: 'help', color: '#8888'
                  }} />
                </Tooltip>
              </InputAdornment>,
          }}>
          {acls.map(a => (
            <MenuItem key={a.uuid} value={a.uuid}>{a.name}</MenuItem>
          ))}
          <MenuItem value='all'>不限</MenuItem>
        </TextField>
        <Typography textAlign='right' sx={{ flex: 1 }} variant='caption' />
        <Button startIcon={<AddIcon />} onClick={() => { navigate('add') }}>
          添加
        </Button>
      </Toolbar>
      <TableContainer component={OutlinedPaper}>
        <Table size='medium'>
          <TableHead>
            <TableRow sx={{ whiteSpace:'nowrap' }}>
              <TableCell align='center'>登录名</TableCell>
              <TableCell align='center'>姓名</TableCell>
              <TableCell align='center'>访问控制</TableCell>
              <TableCell align='center'>创建时间</TableCell>
              <TableCell align='center'>登录时间 / 次数</TableCell>
              <TableCell as='td' align='right' colSpan={2} padding='checkbox' />
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow hover key={user.userid}>
                <TableCell align="center">{user.userid}</TableCell>
                <TableCell align="center">{user.name}</TableCell>
                <TableCell align="center">
                  {parseInt(user.acl_code) === 0 ?
                    <Typography variant='body2' color='secondary'>
                      {user.acl_name}
                    </Typography>
                    :
                    <Typography variant='body2'>{user.acl_name}</Typography>
                  }
                </TableCell>
                <TableCell align="center">
                  {dayjs(user.create_at).format('YY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell align="center">
                  {dayjs(user.signin_at).format('YY-MM-DD HH:mm:ss')} / {user.n_signin}
                </TableCell>
                <TableCell align="right" padding='none'>
                  {user.deleted &&
                    <RemoveCircleOutlineIcon color='error' fontSize='small'
                      sx={{ verticalAlign: 'middle' }}
                    />
                  }
                  {(user.disabled && !user.deleted) &&
                    <BlockIcon color='warning' fontSize='small'
                      sx={{ verticalAlign: 'middle' }}
                    />
                  }
                </TableCell>
                <TableCell align="right" padding='checkbox'>
                  <UserMenuIconButton user={user} requestRefresh={requestRefresh} />
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
                SelectProps={{
                  id: 'pagination-rows-per-page',
                  inputProps: { 'aria-label': '每页行数' }
                }}
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

function UserMenuIconButton(props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [currentUser, setCurrentUser] = useRecoilState(userState);
  const confirm = useConfirm();
  const secretCode = useSecretCode();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const { user, requestRefresh } = props;

  const onClose = () => {
    setAnchorEl(null);
  };

  // 用户资料
  const onProfileClick = () => {
    setAnchorEl(null);
    navigate('profile', { state: { uuid: user.uuid } });
  };

  // 修改资料
  const onModifyClick = () => {
    setAnchorEl(null);
    navigate('modify', { state: { uuid: user.uuid } });
  };

  // 修改密码
  const onPasswdClick = () => {
    setAnchorEl(null);
    navigate('passwd', { state: { uuid: user.uuid, name: user.name } });
  };

  // 访问控制
  const onACLClick = () => {
    setAnchorEl(null);
    navigate('acl', { state: { uuid: user.uuid, name: user.name, acl: user.acl } });
  };

  // 清除安全操作码
  const onClearSecretCode = async () => {
    try {
      setAnchorEl(null);

      await confirm({
        description: `确定要清除 ${user.name} 的安全操作码吗？`,
        confirmationText: '清除',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      await post('/system/user/clearsecretcode',
        new URLSearchParams({ uuid: user.uuid })
      );
      enqueueSnackbar('已清除', { variant: 'success' });

      if (currentUser.userid === user.userid) {
        setCurrentUser({ ...currentUser, secretcode_isset: false });
      }
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 清除两因素认证
  const onClearTOTP = async () => {
    try {
      setAnchorEl(null);

      await confirm({
        description: `确定要清除 ${user.name} 的两因素认证吗？`,
        confirmationText: '清除',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      await post('/system/user/cleartotp',
        new URLSearchParams({ uuid: user.uuid })
      );
      enqueueSnackbar('已清除', { variant: 'success' });

      if (currentUser.userid === user.userid) {
        setCurrentUser({ ...currentUser, totp_isset: false });
      }
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
        description: user.disabled ?
          `确定要恢复 ${user.name} 的账号吗？恢复后该账号可正常使用。`
          :
          `确定要禁用 ${user.name} 的账号吗？禁用后该账号不可以继续使用，直到恢复为止。`,
        confirmationText: user.disabled ? '恢复' : '禁用',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      await post('/system/user/disable',
        new URLSearchParams({ uuid: user.uuid })
      );
      enqueueSnackbar('用户状态更新成功', { variant: 'success' });
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
        description: `确定要删除用户 ${user.name} 吗？删除后用户数据将保留，但账号将永久停用，无法恢复!`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });

      const token = await secretCode();

      const params = new URLSearchParams({
        uuid: user.uuid, secretcode_token: token
      });
      await del('/system/user/delete?' + params.toString());
      enqueueSnackbar('用户已被删除', { variant: 'success' });
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
        <MenuItem onClick={onProfileClick}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>详细资料</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled={user.disabled || user.deleted} onClick={onModifyClick}>
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>修改资料</ListItemText>
        </MenuItem>
        <MenuItem disabled={user.disabled || user.deleted} onClick={onPasswdClick}>
          <ListItemIcon>
            <KeyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>修改密码</ListItemText>
        </MenuItem>
        <MenuItem disabled={user.disabled || user.deleted} onClick={onACLClick}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" color='info' />
          </ListItemIcon>
          <ListItemText>访问控制</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled={user.disabled || user.deleted} onClick={onClearSecretCode}>
          <ListItemIcon>
            <KeyOffIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>清除安全操作码</ListItemText>
        </MenuItem>
        <MenuItem disabled={user.disabled || user.deleted} onClick={onClearTOTP}>
          <ListItemIcon>
            <DeleteForeverIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>清除两因素认证</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled={user.deleted} onClick={onDisableClick}>
          <ListItemIcon>
            {user.disabled ?
              <SettingsBackupRestoreIcon fontSize="small" color='warning' />
              :
              <BlockIcon fontSize="small" color='warning' />
            }
          </ListItemIcon>
          {user.disabled ?
            <ListItemText>恢复</ListItemText>
            :
            <ListItemText>禁用</ListItemText>
          }
        </MenuItem>
        <MenuItem disabled={user.deleted} onClick={onDeleteClick}>
          <ListItemIcon>
            <RemoveCircleOutlineIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
