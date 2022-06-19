import { useEffect, useState } from 'react';
import { useRecoilState } from "recoil";
import { useNavigate, Link } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import SecurityIcon from '@mui/icons-material/Security';
import Stack from '@mui/material/Stack';
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
import UploadIcon from '@mui/icons-material/Upload';
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
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CodeOffOutlinedIcon from '@mui/icons-material/CodeOffOutlined';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import userState from "~/state/user";
import progressState from "~/state/progress";
import useTitle from "~/hook/title";
import SearchInput from '~/comp/search-input';
import { useSecretCode } from '~/comp/secretcode';
import Avatar from '~/comp/avatar';
import TimeAgo from '~/comp/timeago';
import usePageData from '~/hook/pagedata';
import { useSetCode } from "~/state/code";
import { post, del, get } from '~/lib/rest';

export default function Home() {
  const [progress, setProgress] = useRecoilState(progressState);
  const [pageData, setPageData] = usePageData();
  const { enqueueSnackbar } = useSnackbar();
  const [count, setCount] = useState(0);
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [acls, setAcls] = useState([]);
  const [acl, setAcl] = useState('all');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(pageData('rowsPerPage') || 10);
  const [refresh, setRefresh] = useState(true);

  useTitle('用户管理');
  useSetCode(9000);

  const requestRefresh = () => { setRefresh(!refresh); }

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/acl/');
        setAcls(resp.acls || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [ enqueueSnackbar ]);

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const query = new URLSearchParams({ page, rows, keyword, acl });
        const resp = await get('/system/user/list?' + query.toString());
        setCount(resp.count || 0);
        setList(resp.list || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [ enqueueSnackbar, setProgress, page, rows, keyword, acl, refresh ]);

  // 搜索
  const onKeywordChange = value => {
    setPage(0);
    setKeyword(value);
  }

  // 访问控制
  const onAclChange = e => {
    setPage(0);
    setAcl(e.target.value);
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
    <Container as='main' maxWidth='lg' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={progress} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : '搜索...'}
          sx={{ minWidth: 300 }}
        />
        <TextField select variant='standard' sx={{ ml: 2, minWidth: 140 }}
          value={acl} onChange={onAclChange}>
          <MenuItem disabled value="">
            <Typography variant='body2'>角色筛选</Typography>
          </MenuItem>
          <MenuItem value='all'>所有角色</MenuItem>
          {acls.map(a => (
            <MenuItem key={a.uuid} value={a.uuid}>
              <Stack direction='row' alignItems='center' sx={{ width: '100%' }}>
                <Typography textAlign='left' sx={{ flex: 1 }}>{a.name}</Typography>
                <Typography color='gray' sx={{ ml: 2 }}>{a.usercount}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </TextField>
        <Typography textAlign='right' sx={{ flex: 1 }} variant='caption' />
        <Button variant='outlined' size='small' startIcon={<AddIcon />}
          LinkComponent={Link} to='add'>
          添加
        </Button>
        <Button variant='outlined' size='small' color='warning' sx={{ ml: 2 }}
          startIcon={<UploadIcon />} LinkComponent={Link} to='import'>
          批量导入
        </Button>
      </Toolbar>
      <Table size='medium'>
        <TableHead>
          <TableRow sx={{ whiteSpace: 'nowrap' }}>
            <TableCell align='center'></TableCell>
            <TableCell align='center'>登录名</TableCell>
            <TableCell align='center'>姓名</TableCell>
            <TableCell align='center'>访问角色</TableCell>
            <TableCell align='center'>创建时间</TableCell>
            <TableCell align='center'>更新时间</TableCell>
            <TableCell align='center'>最后登录</TableCell>
            <TableCell align='center'>登录次数</TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map(u => (
            <TableRow hover key={u.uuid}
              disabled={u.disabled} deleted={u.deleted?.toString()}>
              <TableCell align="center" padding='checkbox'>
                <Avatar avatar={u.avatar} name={u.name}
                  sx={{ width: 32, height: 32, mx: 1 }}
                />
              </TableCell>
              <TableCell align="center">{u.userid}</TableCell>
              <TableCell align="center">{u.name}</TableCell>
              <TableCell align="center">
                {parseInt(u.acl_code) === 0 ?
                  <Typography variant='body2' color='secondary'>
                    {u.acl_name}
                  </Typography>
                  :
                  <Typography variant='body2'>{u.acl_name}</Typography>
                }
              </TableCell>
              <TableCell align="center">
                <TimeAgo time={u.create_at} variant='body2' />
              </TableCell>
              <TableCell align="center">
                <TimeAgo time={u.update_at} variant='body2' />
              </TableCell>
              <TableCell align="center">
                <TimeAgo time={u.signin_at} variant='body2' />
              </TableCell>
              <TableCell align="center">{u.n_signin}</TableCell>
              <TableCell align='center' padding='none'>
                {u.deleted &&
                  <RemoveCircleOutlineIcon color='error' fontSize='small'
                    sx={{ verticalAlign: 'middle' }}
                  />
                }
                {(u.disabled && !u.deleted) &&
                  <BlockIcon fontSize='small' sx={{ verticalAlign: 'middle' }} />
                }
              </TableCell>
              <TableCell align="center" padding='none' className='action'>
                <UserMenuIconButton user={u} requestRefresh={requestRefresh} />
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
              SelectProps={{
                inputProps: { 'aria-label': '每页行数' }
              }}
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
    navigate('profile', { state: { uuid: user.uuid } });
  };

  // 修改资料
  const onModifyClick = () => {
    navigate('modify', { state: { uuid: user.uuid } });
  };

  // 修改密码
  const onPasswdClick = () => {
    navigate('passwd', { state: { uuid: user.uuid, name: user.name } });
  };

  // 访问控制
  const onACLClick = () => {
    navigate('acl', { state: { uuid: user.uuid, name: user.name, acl: user.acl } });
  };

  // 银行账号
  const onBankClick = () => {
    navigate('bank', { state: { uuid: user.uuid, name: user.name } });
  };

  // 清除安全操作码
  const onClearSecretCode = async () => {
    try {
      await confirm({
        description: `确定要清除 ${user.name} 的安全操作码吗？这将导致用户在进行敏感操作时无需验证安全码`,
        confirmationText: '清除',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      const _audit = `清除用户 ${user.name} 的安全操作码`;

      await post('/system/user/clearsecretcode', new URLSearchParams({
        uuid: user.uuid, _audit,
      }));
      enqueueSnackbar('已清除用户安全操作码', { variant: 'success' });

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
      await confirm({
        description: `确定要清除 ${user.name} 的动态密码设置吗？这将导致用户在登录时无需验证动态密码`,
        confirmationText: '清除',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      const _audit = `清除用户 ${user.name} 的动态密码`;

      await post('/system/user/cleartotp', new URLSearchParams({
        uuid: user.uuid, _audit,
      }));
      enqueueSnackbar('已清除用户一次性密码设置', { variant: 'success' });

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
      await confirm({
        description: user.disabled ?
          `确定要恢复 ${user.name} 的账号吗？恢复后该账号将立即恢复正常使用。`
          :
          `确定要禁用 ${user.name} 的账号吗？禁用后该账号不能再继续使用，直到恢复为止。`,
        confirmationText: user.disabled ? '恢复' : '禁用',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      const _audit = `${user.disabled ? '恢复' : '禁用'}用户 ${user.name}`;

      await post('/system/user/disable', new URLSearchParams({
        uuid: user.uuid, _audit,
      }));
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
      await confirm({
        description: `确定要删除用户 ${user.name} 吗？删除后用户数据将保留，但账号将永久停用，且无法恢复!`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });
      const token = await secretCode();

      const _audit = `删除用户 ${user.name}`;

      const params = new URLSearchParams({
        uuid: user.uuid, secretcode_token: token, _audit,
      });
      await del('/system/user/delete?' + params.toString());
      enqueueSnackbar('用户已删除', { variant: 'success' });
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
      <Menu anchorEl={anchorEl} open={open} onClose={onClose} onClick={onClose}>
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
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>访问控制</ListItemText>
        </MenuItem>
        <MenuItem disabled={user.disabled || user.deleted} onClick={onBankClick}>
          <ListItemIcon>
            <CreditCardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>银行账号</ListItemText>
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
            <CodeOffOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>清除动态密码</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onProfileClick}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>详细资料</ListItemText>
        </MenuItem>
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
          <ListItemText>删除用户</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
