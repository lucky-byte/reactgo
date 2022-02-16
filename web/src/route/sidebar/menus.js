import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DashboardIcon from '@mui/icons-material/Dashboard';

const menus = [{
  title: '看板',
  items: [{
    code: 100,
    icon: DashboardIcon,
  }],
}, {
  title: '层级管理',
  items: [{
    code: 9200,
    icon: AccountTreeIcon,
  }],
}, {
  title: '系统管理',
  items: [{
    code: 9000,
    icon: SupervisorAccountIcon,
  }, {
    code: 9010,
    icon: SecurityIcon,
  }, {
    code: 9020,
    icon: HistoryIcon,
  }, {
    code: 9030,
    icon: SettingsIcon,
  }, {
    code: 9040,
    icon: NotificationsIcon,
  }, {
    code: 9050,
    icon: AccessAlarmIcon,
  }],
}]

export default menus;
