import PersonIcon from '@mui/icons-material/Person';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CampaignIcon from '@mui/icons-material/Campaign';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import SupportIcon from '@mui/icons-material/Support';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import RouteIcon from '@mui/icons-material/Route';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

const menus = [{
  title: '欢迎',
  items: [{
    code: 100,
    icon: AccessibilityNewIcon,
  }, {
    code: 101,
    icon: DashboardOutlinedIcon,
  }],
}, {
  title: '资源管理',
  items: [{
    code: 7100,
    icon: PhotoOutlinedIcon,
  }, {
    code: 7200,
    icon: SlideshowIcon,
  }, {
    code: 7300,
    icon: ArticleOutlinedIcon,
  }],
}, {
  title: '设计工具',
  items: [{
    code: 7500,
    icon: DesignServicesIcon,
  }, {
    code: 7600,
    icon: RouteIcon,
  }],
}, {
  title: '系统管理',
  items: [{
    code: 9000,
    icon: PersonIcon,
  }, {
    code: 9010,
    icon: SecurityIcon,
  }, {
    code: 9020,
    icon: HistoryIcon,
  }, {
    code: 9025,
    icon: AppRegistrationIcon,
  }, {
    code: 9030,
    icon: ReportGmailerrorredIcon,
  }, {
    code: 9040,
    icon: SettingsIcon,
  }, {
    code: 9050,
    icon: AccessAlarmIcon,
  }, {
    code: 9060,
    icon: AcUnitIcon,
  }, {
    code: 9070,
    icon: CampaignIcon,
  }, {
    code: 9999,
    icon: SupportIcon,
  }],
}]

export default menus;
