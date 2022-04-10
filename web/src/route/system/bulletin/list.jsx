import { lazy, useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Zoom from '@mui/material/Zoom';
import AddIcon from '@mui/icons-material/Add';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import SendIcon from '@mui/icons-material/Send';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import Menu from '@mui/material/Menu';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import dayjs from 'dayjs';
import SearchInput from '~/comp/search-input';
import { useSecretCode } from '~/comp/secretcode';
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import { post, put, del } from '~/rest';
import { IconButton, Tooltip } from '@mui/material';

// 代码拆分
const Markdown = lazy(() => import('~/comp/markdown'));

export default function List() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [keyword, setKeyword] = useState([]);
  const [days, setDays] = useState(7);
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [rows] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useTitle('系统公告');

  // 获取列表数据
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const resp = await post('/system/bulletin/', new URLSearchParams({
          page, rows, keyword, days,
        }));
        if (resp.count > 0) {
          let pages = resp.count / rows;
          if (resp.count % rows > 0) {
            pages += 1;
          }
          setPageCount(parseInt(pages));
        } else {
          setPageCount(0);
        }
        setCount(resp.count);
        setList(resp.list || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, page, rows, keyword, days]);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setList(list.map(e => {
        e.timeAgo = dayjs(e.create_at).fromNow();
        return e;
      }));
    }, 1000);
    return () => clearInterval(timer)
  }, [list]);

  // 搜索
  const onKeywordChange = value => {
    setPage(0);
    setKeyword(value);
  }

  // 时间段
  const onDaysChange = e => {
    setPage(0);
    setDays(e.target.value);
  }

  // 点击标题展开
  const onAccordionTitleClick = bulletin => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].uuid === bulletin.uuid) {
        list[i]._expanded = !list[i]._expanded;
        break;
      }
    }
    setList([...list]);
  }

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchInput isLoading={loading} onChange={onKeywordChange}
          placeholder={count > 0 ? `在 ${count} 条记录中搜索...` : ''}
          sx={{ minWidth: 300 }}
        />
        <TextField
          select variant='standard' sx={{ ml: 2, minWidth: 100 }}
          value={days} onChange={onDaysChange}>
          <MenuItem value={7}>近一周</MenuItem>
          <MenuItem value={30}>近一月</MenuItem>
          <MenuItem value={90}>近三月</MenuItem>
          <MenuItem value={365}>近一年</MenuItem>
          <MenuItem value={365000}>不限时间</MenuItem>
        </TextField>
        <Typography textAlign='right' sx={{ flex: 1 }} variant='caption' />
        <Button variant='outlined' size='small' startIcon={<AddIcon />}
          onClick={() => { navigate('add') }}>
          发布公告
        </Button>
      </Toolbar>

      <Paper variant='outlined' sx={{ mt: 0 }}>
        {list.map(b => (
          <Accordion key={b.uuid} elevation={0} disableGutters
            expanded={b._expanded || false} sx={{
              borderBottom: '1px solid #8884',
              '&:before': { display: 'none', },
              '&:last-child': { borderBottom: 0, }
            }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction='row' alignItems='center' spacing={1} sx={{ flex: 1, mr: 1 }}>
                <StatusIcon status={b.status} />
                <Typography variant='subtitle1' sx={{ flex: 1 }}
                  onClick={() => onAccordionTitleClick(b)}>
                  {b.title}
                </Typography>
                {b.deleted && <Chip variant='outlined' label="已删除" size='small' color='error' />}
                {b.draft && <Chip label="草稿" size='small' />}
                <Typography variant='caption' sx={{ color: 'gray' }}
                  onClick={() => onAccordionTitleClick(b)}>
                  已读：{b.nreaders}/{b.ntargets}，
                  {b.timeAgo || dayjs(b.create_at).fromNow()}
                </Typography>
                <MenuIcon bulletin={b} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{
                minHeight: 80,
                maxHeight: 300,
                overflow: 'auto',
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'black' : 'white',
              }}>
              <Stack direction='row' spacing={2}>
                <Markdown sx={{ flex: 1 }}>{b.content}</Markdown>
                <Tools bulletin={b} />
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
      <Stack alignItems='center' sx={{ mt: 2 }}>
        <Pagination count={pageCount} color="primary" page={page + 1}
          onChange={(e, newPage) => { setPage(newPage - 1) }}
        />
      </Stack>
    </Container>
  )
}

// 状态图标
function StatusIcon(props) {
  switch (props.status) {
    case 1:
      return <SaveAsIcon color='disabled' />
    case 2:
      return <ScheduleSendIcon color='disabled' />
    case 3:
      return <SendIcon color='success' />
    case 4:
      return <CancelScheduleSendIcon color='error' />
    default:
      return <HelpOutlineIcon color='disabled' />
  }
}

function MenuIcon(props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  // const [currentUser, setCurrentUser] = useRecoilState(userState);
  const confirm = useConfirm();
  const secretCode = useSecretCode();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const { bulletin, requestRefresh } = props;

  const onOpenClick = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  }

  const onClose = () => {
    setAnchorEl(null);
  };

  // 用户资料
  const onProfileClick = () => {
    // setAnchorEl(null);
    // navigate('profile', { state: { uuid: user.uuid } });
  };

  // 修改资料
  const onModifyClick = () => {
    setAnchorEl(null);
    // navigate('modify', { state: { uuid: user.uuid } });
  };

  // 修改密码
  const onPasswdClick = () => {
    setAnchorEl(null);
    // navigate('passwd', { state: { uuid: user.uuid, name: user.name } });
  };

  // 访问控制
  const onACLClick = () => {
    setAnchorEl(null);
    // navigate('acl', { state: { uuid: user.uuid, name: user.name, acl: user.acl } });
  };

  // 清除两因素认证
  // const onClearTOTP = async () => {
  //   try {
  //     setAnchorEl(null);

  //     await confirm({
  //       description: `确定要清除 ${user.name} 的两因素认证吗？`,
  //       confirmationText: '清除',
  //       confirmationButtonProps: { color: 'warning' },
  //       contentProps: { p: 8 },
  //     });
  //     await post('/system/user/cleartotp',
  //       new URLSearchParams({ uuid: user.uuid })
  //     );
  //     enqueueSnackbar('已清除', { variant: 'success' });

  //     if (currentUser.userid === user.userid) {
  //       setCurrentUser({ ...currentUser, totp_isset: false });
  //     }
  //   } catch (err) {
  //     if (err) {
  //       enqueueSnackbar(err.message);
  //     }
  //   }
  // }

  // 禁用/启用
  // const onDisableClick = async () => {
  //   try {
  //     setAnchorEl(null);

  //     await confirm({
  //       description: user.disabled ?
  //         `确定要恢复 ${user.name} 的账号吗？恢复后该账号可正常使用。`
  //         :
  //         `确定要禁用 ${user.name} 的账号吗？禁用后该账号不可以继续使用，直到恢复为止。`,
  //       confirmationText: user.disabled ? '恢复' : '禁用',
  //       confirmationButtonProps: { color: 'warning' },
  //       contentProps: { p: 8 },
  //     });
  //     await post('/system/user/disable',
  //       new URLSearchParams({ uuid: user.uuid })
  //     );
  //     enqueueSnackbar('用户状态更新成功', { variant: 'success' });
  //     requestRefresh();
  //   } catch (err) {
  //     if (err) {
  //       enqueueSnackbar(err.message);
  //     }
  //   }
  // }

  // 删除
  const onDeleteClick = async () => {
    try {
      onClose();

      await confirm({
        description: `确定要删除该记录吗？删除后无法恢复!`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });

      const token = await secretCode();

      const params = new URLSearchParams({
        uuid: bulletin.uuid, secretcode_token: token
      });
      await del('/system/bulletin/del?' + params.toString());
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
      <IconButton
        size='small'
        aria-label='菜单'
        aria-controls={open ? '菜单' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={onOpenClick}
        >
        <MoreVertIcon fontSize='small' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        {/* <MenuItem disabled={user.disabled || user.deleted} onClick={onModifyClick}>
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
        <Divider /> */}
        {/* <MenuItem disabled={user.deleted} onClick={onDisableClick}>
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
        </MenuItem> */}
        <MenuItem disabled={bulletin.deleted} onClick={onDeleteClick}>
          <ListItemIcon>
            <RemoveCircleOutlineIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

function Tools(props) {
  const [fullScreenOpen, setFullScreenOpen] = useState(false);

  const { bulletin } = props;

  const contentRef = useRef();
  const print = usePrint(contentRef.current);

  const onOpenFullScreen = () => {
    setFullScreenOpen(true);
  }

  const onCloseFullScreen = () => {
    setFullScreenOpen(false);
  }

  return (
    <>
      <Tooltip title='全屏'>
        <Fab size='small' aria-label="全屏" color='primary' onClick={onOpenFullScreen}
          sx={{ position: 'sticky', top: 0, right: 0 }}>
          <OpenInFullIcon fontSize='small' />
        </Fab>
      </Tooltip>
      <Dialog onClose={onCloseFullScreen} open={fullScreenOpen} fullScreen
        TransitionComponent={Zoom}>
        <Container maxWidth='md' sx={{ my: 4 }} ref={contentRef}>
          <Typography variant='h4' textAlign='center'>{bulletin.title}</Typography>
          <Typography variant='caption' paragraph textAlign='right'>
            {dayjs(bulletin.create_at).format('LLLL')} by{' '}
            {bulletin.user_name || bulletin.userid}
          </Typography>
          <Stack direction='row' sx={{ mb: 1 }} spacing={1} alignItems='center'>
            {bulletin.deleted && <Chip label="已删除" size='small' color='error' />}
            {bulletin.draft ?
              <Chip label="草稿" size='small' />
              :
              <Typography variant='body2' sx={{ color: 'gray' }}>
                发布于:
                已读：{bulletin.nreaders} / {bulletin.ntargets}
              </Typography>
            }
          </Stack>
          <Markdown>{bulletin.content}</Markdown>
        </Container>
        <Stack direction='row' spacing={2} sx={{ position: 'fixed', top: 10, right: 10 }}>
          <IconButton onClick={print}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onCloseFullScreen}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Dialog>
    </>
  )
}
