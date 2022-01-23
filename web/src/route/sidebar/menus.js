import CurrencyYenIcon from '@mui/icons-material/CurrencyYen';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessIcon from '@mui/icons-material/Business';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PieChartIcon from '@mui/icons-material/PieChart';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HistoryIcon from '@mui/icons-material/History';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';

const menus = [{
  title: '今日看板',
  items: [{
    code: 100,
    icon: CurrencyYenIcon,
  }, {
    code: 110,
    icon: BusinessIcon,
  }, {
    code: 120,
    icon: StorefrontIcon,
  }],
}, {
  title: '订单管理',
  items: [{
    code: 200,
    icon: FormatListBulletedIcon,
  }, {
    code: 210,
    icon: QueryStatsIcon,
  }],
}, {
  title: '商户管理',
  items: [{
    code: 300,
    icon: AddIcon,
  }, {
    code: 310,
    icon: StorefrontIcon,
  }, {
    code: 320,
    icon: QrCode2Icon,
  }, {
    code: 330,
    icon: SettingsEthernetIcon,
  }],
}, {
  title: '渠道管理',
  items: [{
    code: 400,
    icon: BusinessIcon,
  }, {
    code: 410,
    icon: ManageSearchIcon,
  }, {
    code: 420,
    icon: InsightsIcon,
  }],
}, {
  title: '报表管理',
  items: [{
    code: 500,
    icon: AssessmentIcon,
  }, {
    code: 510,
    icon: PieChartIcon,
  }, {
    code: 520,
    icon: SsidChartIcon,
  }],
}, {
  title: '业务拓展',
  items: [{
    code: 600,
    icon: StorefrontIcon,
  }, {
    code: 610,
    icon: BusinessIcon,
  }],
}, {
  title: '系统管理',
  items: [{
    code: 700,
    icon: SupervisorAccountIcon,
  }, {
    code: 710,
    icon: SecurityIcon,
  }, {
    code: 720,
    icon: HistoryIcon,
  }, {
    code: 730,
    icon: SettingsIcon,
  }, {
    code: 740,
    icon: AccessAlarmIcon,
  }, {
    code: 750,
    icon: NotificationsIcon,
  }],
}]

export default menus;
