import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';

const menus = [{
  title: '看板',
  items: [{
    code: 100,
    icon: DashboardIcon,
  }],
}, {
  title: '系统管理',
  items: [{
    code: 1000,
    icon: SupervisorAccountIcon,
  }, {
    code: 1100,
    icon: SecurityIcon,
  }, {
    code: 1200,
    icon: HistoryIcon,
  }, {
    code: 1300,
    icon: SettingsIcon,
  }, {
    code: 1400,
    icon: AccessAlarmIcon,
  }, {
    code: 1500,
    icon: NotificationsIcon,
  }],
}]

export default menus;
