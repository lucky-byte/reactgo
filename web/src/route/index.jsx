import { useEffect, useState, forwardRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useTheme } from "@mui/material/styles";
import { Routes, Route, useNavigate, Link as RouteLink, useLocation } from "react-router-dom";
import Cookies from 'universal-cookie';
import Box from "@mui/material/Box";
import Collapse from '@mui/material/Collapse';
import Stack from "@mui/material/Stack";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import KeyIcon from '@mui/icons-material/Key';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from "@mui/material/Link";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from "@mui/material/FormHelperText";
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import Chip from '@mui/material/Chip';
import DirectionsIcon from '@mui/icons-material/Directions';
import Slide from '@mui/material/Slide';
import Portal from '@mui/material/Portal';
import LinearProgress from '@mui/material/LinearProgress';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import Sidebar from "./sidebar";
import urlCodes from "./sidebar/codes";
import titleState from "../state/title";
import userState from "../state/user";
import sidebarState from "../state/sidebar";
import progressState from "../state/progress";
import codeState from "../state/code";
import { get, put } from "../rest";
import LuckyByte from '../img/lucky-byte.png';
import LuckyByteDark from '../img/lucky-byte-dark.png';
import { useColorModeContent } from "../app";
import NotFound from "./notfound";
import Codes from "./codes";
import Dashboard from "./dashboard";
import System from "./system";

export default function Index() {
  const location = useLocation();
  const sidebar = useRecoilValue(sidebarState);
  const progress = useRecoilValue(progressState);
  const setCode = useSetRecoilState(codeState);
  const [progressVisible, setProgressVisible] = useState(false);

  // 延迟显示全局进度条
  useEffect(() => {
    if (progress) {
      const timer = setTimeout(() => { setProgressVisible(progress); }, 300)
      return () => { clearTimeout(timer); }
    } else {
      setProgressVisible(false);
    }
  }, [progress]);

  // 通过 pathname 设置高亮侧边栏选项
  useEffect(() => {
    try {
      const entries = Object.entries(urlCodes);

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const { to } = entry[1];
        if (to === location.pathname) {
          setCode(parseInt(entry[0]));
          break;
        }
      }
    } catch (err) {
      console.error('change code error:' + err.message)
    }
  }, [location.pathname, setCode]);

  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      {progressVisible &&
        <Portal>
          <LinearProgress sx={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 'modal'
          }} />
        </Portal>
      }
      <Collapse orientation="horizontal" in={sidebar}>
        <Sidebar />
      </Collapse>
      <Stack sx={{ flex: 1, height: '100vh' }}>
        <Appbar />
        <Box sx={{ maxHeight: '100%', overflow: 'scroll' }}>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='system/*' element={<System />} />
            <Route path='/codes' element={<Codes />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Box>
      </Stack>
    </Box>
  )
}

function Appbar(params) {
  const theme = useTheme();
  const colorMode = useColorModeContent();
  const navigate = useNavigate();
  const title = useRecoilValue(titleState);
  const [user, setUser] = useRecoilState(userState);
  const [sidebar, setSidebar] = useRecoilState(sidebarState);
  const [anchorEl, setAnchorEl] = useState(null);
  const sidebarOpen = Boolean(anchorEl);
  const { enqueueSnackbar } = useSnackbar();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  useHotkeys('ctrl+k, cmd+k', () => { setNavigatorOpen(true); }, {
    enableOnTags: ['INPUT'],
  });
  useHotkeys('ctrl+h, cmd+h', () => { setSidebar(!sidebar); }, {
    enableOnTags: ['INPUT'],
  });

  const Logo = theme.palette.mode === 'dark' ? LuckyByteDark : LuckyByte;

  useEffect(() => { document.title = title; }, [title])

  useEffect(() => {
    // 如果 token 无效，则跳转登录页面
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('last-access', window.location.pathname);
      return navigate('/signin', { replace: true });
    }
    // 更新用户信息
    if (!user || !user.userid) {
      (async () => {
        try {
          const resp = await get('/user/info');
          if (!resp || !resp.userid) {
            return enqueueSnackbar('服务器响应数据不完整', { variant: 'error' });
          }
          setUser({
            userid: resp.userid,
            name: resp.name,
            mobile: resp.mobile,
            email: resp.email,
            allows: resp.allows,
          });
        } catch (err) {
          enqueueSnackbar(err.message, { variant: 'error' });
        }
      })();
    }
  }, [user, setUser, navigate, enqueueSnackbar]);

  // 显示/隐藏 菜单栏
  const openSidebarClick = () => {
    setSidebar(!sidebar);
  }

  // 快速导航
  const onQuickNavigate = () => {
    setNavigatorOpen(true);
  }

  const onUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onUserMenuClose = () => {
    setAnchorEl(null);
  };

  // 修改密码
  const onChangePassword = () => {
    setAnchorEl(null);
    setPasswordOpen(true);
  }

  // 退出登录
  const onLogout = () => {
    const cookies = new Cookies();
    cookies.remove('csrf', { path: '/' });
    localStorage.removeItem('token');
    setUser(null);
    setAnchorEl(null);
    enqueueSnackbar('已退出登录', { variant: 'success' });
    setTimeout(() => { window.location.href = '/signin'; }, 500);
  }

  return (
    <AppBar position="static" color='transparent' elevation={2} sx={{ zIndex: 1 }}>
      <Toolbar>
        <IconButton aria-label="菜单" sx={{ mr: 1 }} color='primary'
          onClick={openSidebarClick}>
          {sidebar ?  <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
        {!sidebar &&
          <Link component={RouteLink} to='/' sx={{ mr: 2, lineHeight: 1 }}>
            <img src={Logo} alt='Logo' height='32px' />
          </Link>
        }
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Chip label='CTRL+K' variant='outlined' color='info' icon={<DirectionsIcon />}
          onClick={onQuickNavigate}
        />
        <IconButton onClick={colorMode.toggleColorMode} color="primary" sx={{ mx: 1 }}>
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <Button
          aria-controls={sidebarOpen ? '用户菜单' : undefined}
          aria-haspopup="true"
          aria-expanded={sidebarOpen ? 'true' : undefined}
          onClick={onUserMenuOpen}>
          {user?.name || user?.userid}
        </Button>
        <Menu anchorEl={anchorEl} open={sidebarOpen} onClose={onUserMenuClose}>
          <MenuItem onClick={onChangePassword}>
            <ListItemIcon>
              <KeyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>修改密码</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={onLogout}>
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>退出登录</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
      <PasswordDialog open={passwordOpen} setOpen={setPasswordOpen} />
      <QuickNavigator open={navigatorOpen} setOpen={setNavigatorOpen} />
    </AppBar>
  )
}

// 修改密码
function PasswordDialog(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [oldPasswordHide, setOldPasswordHide] = useState(true);
  const [newPasswordHide, setNewPasswordHide] = useState(true);
  const [newPassword2Hide, setNewPassword2Hide] = useState(true);

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setNewPassword2('');
    props.setOpen(false);
  }

  const onChangeClick = async () => {
    if (newPassword !== newPassword2) {
      return enqueueSnackbar('2次输入的新密码不一致', { variant: 'warning' });
    }
    if (oldPassword === newPassword) {
      return enqueueSnackbar('新旧密码不能相同', { variant: 'warning' });
    }
    try {
      await put('/user/passwd', new URLSearchParams({ oldPassword, newPassword }));
      enqueueSnackbar('修改成功', { variant: 'success' });
      handleClose();
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth='xs'>
      <DialogTitle>修改密码</DialogTitle>
      <DialogContent sx={{ px: 4 }}>
        <TextField fullWidth
          label="原登录密码" variant="standard"
          type={oldPasswordHide ? 'password' : 'text'}
          value={oldPassword}
          onChange={(e) => { setOldPassword(e.target.value); }}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <IconButton size='small' onClick={() => {
                  setOldPasswordHide(!oldPasswordHide);
                }}>
                  {oldPasswordHide ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>,
          }}
        />
        <TextField sx={{mt:2}} fullWidth
          label="新登录密码" variant="standard"
          type={newPasswordHide ? 'password' : 'text'}
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); }}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <IconButton size='small' onClick={() => {
                  setNewPasswordHide(!newPasswordHide);
                }}>
                  {newPasswordHide ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>,
          }}
        />
        <TextField sx={{mt:2}} fullWidth
          label="确认新登录密码" variant="standard"
          type={newPassword2Hide ? 'password' : 'text'}
          value={newPassword2}
          onChange={(e) => { setNewPassword2(e.target.value); }}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <IconButton size='small' onClick={() => {
                  setNewPassword2Hide(!newPassword2Hide);
                }}>
                  {newPassword2Hide ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>,
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 4, py: 3 }}>
        <Button color="secondary" onClick={handleClose}>取消</Button>
        <Button variant="contained" onClick={onChangeClick}>修改</Button>
      </DialogActions>
    </Dialog>
  )
}

const SlideTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

// 快速导航
function QuickNavigator(props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [codeInput, setCodeInput] = useState('');
  const [message, setMessage] = useState('');

  const onClose = () => {
    setCodeInput('');
    setMessage('');
    props.setOpen(false);
  }

  const onCodeChange = e => {
    setMessage('');
    setCodeInput(e.target.value);
  }

  const onKeyDown = e => {
    if (e.key !== 'Enter') {
      return;
    }
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (codeInput.length < 3) {
      return;
    }
    try {
      const codeVal = parseInt(codeInput);
      const item = urlCodes[codeVal];
      if (item && item.to) {
        onClose();
        navigate(item.to);
      } else {
        setCodeInput('');
        setMessage(`代码 ${codeInput} 不存在，请重新输入`);
      }
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  }

  const onViewCodes = () => {
    onClose();
    navigate('/codes');
  }

  return (
    <Dialog open={props.open} onClose={onClose}
      PaperProps={{ sx: { alignSelf: 'flex-start' } }}
      TransitionComponent={SlideTransition}>
      <DialogContent>
        <TextField autoFocus label="导航代码" variant="outlined"
          placeholder="3到4位数字，回车确定"
          InputProps={{
            endAdornment:
              <InputAdornment position="end"><KeyboardReturnIcon /></InputAdornment>
          }}
          inputProps={{ maxLength: 4 }}
          value={codeInput} onChange={onCodeChange} onKeyDown={onKeyDown}
        />
        {message ?
          <FormHelperText error>{message}</FormHelperText>
          :
          <FormHelperText>
            <Link component='button' variant='caption' underline='none'
              onClick={onViewCodes}>
              查看代码清单-911
            </Link>
          </FormHelperText>
        }
      </DialogContent>
    </Dialog>
  )
}
