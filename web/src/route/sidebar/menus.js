import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CampaignIcon from '@mui/icons-material/Campaign';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import ShareIcon from '@mui/icons-material/Share';

const menus = [{
  title: '欢迎',
  items: [{
    code: 100,
    icon: AccessibilityNewIcon,
  }, {
    code: 101,
    icon: DashboardIcon,
  }],
}, {
  title: '资源管理',
  items: [{
    code: 101,
    icon: DashboardIcon,
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
    icon: ReportGmailerrorredIcon,
  }, {
    code: 9050,
    icon: AccessAlarmIcon,
  }, {
    code: 9060,
    icon: ShareIcon,
  }, {
    code: 9070,
    icon: CampaignIcon,
  }],
}]

export default menus;
