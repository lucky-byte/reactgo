import { useState } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { useTheme } from "@mui/material/styles";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Cookies from 'universal-cookie';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Link from "@mui/material/Link";
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DirectionsIcon from '@mui/icons-material/Directions';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyIcon from '@mui/icons-material/Key';
import SecurityIcon from '@mui/icons-material/Security';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';
import AddTaskIcon from '@mui/icons-material/AddTask';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useHotkeys } from 'react-hotkeys-hook';
import useColorModeContent from "~/hook/colormode";
import Avatar from '~/comp/avatar';
import titleState from "~/state/title";
import userState from "~/state/user";
import sidebarState from "~/state/sidebar";
import { setLastAccess } from '~/lib/last-access';
import Banner from '~/comp/banner';
import Navigator from './navigator';
import Notification from './notification';
import Chat from "./chat";
import Flow from "./flow";

export default function Appbar(params) {
  const theme = useTheme();
  const colorMode = useColorModeContent();
  const navigate = useNavigate();
  const title = useRecoilValue(titleState);
  const [user, setUser] = useRecoilState(userState);
  const [sidebar, setSidebar] = useRecoilState(sidebarState);
  const [anchorEl, setAnchorEl] = useState(null);
  const sidebarOpen = Boolean(anchorEl);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  useHotkeys('ctrl+k, cmd+k', () => { setNavigatorOpen(true); }, {
    enableOnTags: ['INPUT'],
  });
  useHotkeys('ctrl+h, cmd+h', () => { setSidebar(!sidebar); }, {
    enableOnTags: ['INPUT'],
  });

  // 用户角色具有开放平台特征
  const openpt = user?.acl_features?.indexOf('openpt') >= 0;

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

  // 退出登录
  const onLogout = () => {
    const cookies = new Cookies();
    cookies.remove('csrf', { path: '/' });
    localStorage.clear();
    setUser(null);

    // 记录最后访问页面，下次登录时进行跳转
    setLastAccess(window.location.pathname);
    navigate('/signin', { replace: true });
  }

  return (
    <AppBar position="static" color='transparent' elevation={0}
      sx={{ zIndex: 1, borderBottom: `1px solid #8882` }}>
      <Toolbar>
        {openpt ?
          <Link component={RouteLink} to='/' sx={{ mr: 2, lineHeight: 1 }}>
            <Banner height={24} />
          </Link>
          :
          <>
            <IconButton aria-label="菜单" sx={{ mr: 1 }} color='primary'
              onClick={openSidebarClick}>
              {sidebar ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
            {!sidebar &&
              <Link component={RouteLink} to='/' sx={{ mr: 2, lineHeight: 1 }}>
                <Banner height={24} />
              </Link>
            }
          </>
        }
        <Typography component='h1' variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Chip label='CTRL+K' variant='outlined' color='info' icon={<DirectionsIcon />}
            onClick={onQuickNavigate} sx={{ mx: 1 }}
          />
          <Chat />
          <Flow />
          <Notification />
          <Tooltip title='切换色彩模式' arrow>
            <IconButton aria-label="切换色彩模式"
              onClick={colorMode.toggleColorMode} color="primary">
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          {user?.avatar ?
            <IconButton onClick={onUserMenuOpen}>
              <Avatar avatar={user?.avatar} name={user?.name} />
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
        </Stack>
        <Menu anchorEl={anchorEl} open={sidebarOpen} onClose={onUserMenuClose}
          onClick={onUserMenuClose}>
          <MenuItem component={RouteLink} to='/user/profile'>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>个人资料</ListItemText>
          </MenuItem>
          <MenuItem component={RouteLink} to='/user/password'>
            <ListItemIcon>
              <KeyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>修改密码</ListItemText>
          </MenuItem>
          <MenuItem component={RouteLink} to='/user/security'>
            <ListItemIcon>
              <SecurityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>安全设置</ListItemText>
          </MenuItem>
          <MenuItem component={RouteLink} to='/user/oauth'>
            <ListItemIcon>
              <GroupAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>身份授权</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem component={RouteLink} to='/user/notification'>
            <ListItemIcon>
              <AddTaskIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>流程</ListItemText>
          </MenuItem>
          <MenuItem component={RouteLink} to='/user/notification'>
            <ListItemIcon>
              <PhoneForwardedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>联络</ListItemText>
          </MenuItem>
          <MenuItem component={RouteLink} to='/user/notification'>
            <ListItemIcon>
              <CurrencyExchangeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>收款</ListItemText>
          </MenuItem>
          <MenuItem component={RouteLink} to='/user/notification'>
            <ListItemIcon>
              <NotificationsNoneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>通知</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem component={Link} href='/public/bulletin' target='_blank'>
            <ListItemIcon>
              <CampaignIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>公告</ListItemText>
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
