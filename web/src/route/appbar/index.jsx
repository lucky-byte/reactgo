import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { useTheme } from "@mui/material/styles";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Cookies from 'universal-cookie';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Link from "@mui/material/Link";
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from "@mui/material/Avatar";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DirectionsIcon from '@mui/icons-material/Directions';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyIcon from '@mui/icons-material/Key';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import useColorModeContent from "~/hook/colormode";
import titleState from "~/state/title";
import userState from "~/state/user";
import sidebarState from "~/state/sidebar";
import { get } from "~/rest";
import Banner from '~/img/banner.png';
import BannerDark from '~/img/banner-dark.png';
import Navigator from './navigator';
import Notification from './notification';

export default function Appbar(params) {
  const theme = useTheme();
  const colorMode = useColorModeContent();
  const navigate = useNavigate();
  const title = useRecoilValue(titleState);
  const [user, setUser] = useRecoilState(userState);
  const [sidebar, setSidebar] = useRecoilState(sidebarState);
  const [anchorEl, setAnchorEl] = useState(null);
  const sidebarOpen = Boolean(anchorEl);
  const { enqueueSnackbar } = useSnackbar();
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  useHotkeys('ctrl+k, cmd+k', () => { setNavigatorOpen(true); }, {
    enableOnTags: ['INPUT'],
  });
  useHotkeys('ctrl+h, cmd+h', () => { setSidebar(!sidebar); }, {
    enableOnTags: ['INPUT'],
  });

  const Logo = theme.palette.mode === 'dark' ? BannerDark : Banner;

  // 自动更新文档标题
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
            uuid: resp.uuid,
            userid: resp.userid,
            avatar: resp.avatar ? `/image/?u=${resp.avatar}` : '',
            name: resp.name,
            mobile: resp.mobile,
            email: resp.email,
            address: resp.address,
            secretcode_isset: resp.secretcode_isset,
            totp_isset: resp.totp_isset,
            allows: resp.allows,
            activate: true,
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

  // 个人资料
  const onProfile = () => {
    onUserMenuClose();
    navigate('user/profile');
  }

  // 修改密码
  const onChangePassword = () => {
    setAnchorEl(null);
    navigate('user/password');
  }

  // 安全设置
  const onSecurity = () => {
    onUserMenuClose();
    navigate('user/security');
  }

  // 通知
  const onNotification = () => {
    onUserMenuClose();
    navigate('user/notification');
  }

  // 关于
  const onAbout = () => {
    onUserMenuClose();
    navigate('/about');
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
    <AppBar position="static" color='transparent' elevation={1} sx={{ zIndex: 1 }}>
      <Toolbar>
        <IconButton aria-label="菜单" sx={{ mr: 1 }} color='primary'
          onClick={openSidebarClick}>
          {sidebar ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
        {!sidebar &&
          <Link component={RouteLink} to='/' sx={{ mr: 2, lineHeight: 1 }}>
            <img src={Logo} alt='Logo' height='24px' width='100px' />
          </Link>
        }
        <Typography component='h1' variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Chip label='CTRL+K' variant='outlined' color='info' icon={<DirectionsIcon />}
          onClick={onQuickNavigate} sx={{ mx: 1 }}
        />
        <Notification />
        <IconButton aria-label="切换色彩模式"
          onClick={colorMode.toggleColorMode} color="primary">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {user?.avatar ?
          <IconButton onClick={onUserMenuOpen}>
            <Avatar src={user.avatar} alt={user.name || user.userid} />
          </IconButton>
          :
          <Button
            aria-label="用户菜单"
            title="用户菜单"
            aria-controls={sidebarOpen ? '用户菜单' : undefined}
            aria-haspopup="true"
            aria-expanded={sidebarOpen ? 'true' : undefined}
            onClick={onUserMenuOpen}>
            {user?.name || user?.userid || 'WhoAmI'}
          </Button>
        }
        <Menu anchorEl={anchorEl} open={sidebarOpen} onClose={onUserMenuClose}>
          <MenuItem onClick={onProfile}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>个人资料</ListItemText>
          </MenuItem>
          <MenuItem onClick={onChangePassword}>
            <ListItemIcon>
              <KeyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>修改密码</ListItemText>
          </MenuItem>
          <MenuItem onClick={onSecurity}>
            <ListItemIcon>
              <SecurityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>安全设置</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={onNotification}>
            <ListItemIcon>
              <NotificationsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>通知</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={onAbout}>
            <ListItemIcon>
              <SupportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>关于</ListItemText>
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
      <Navigator open={navigatorOpen} setOpen={setNavigatorOpen} />
    </AppBar>
  )
}
