import { useEffect, useState } from 'react';
import { useRecoilState } from "recoil";
import { Link as RouteLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Icon from '@mdi/react';
import { mdiGoogleChrome } from '@mdi/js';
import { mdiFirefox } from '@mdi/js';
import { mdiMicrosoftEdge } from '@mdi/js';
import { mdiAppleSafari } from '@mdi/js';
import { mdiOpera } from '@mdi/js';
import { useSnackbar } from 'notistack';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import isEmail from 'validator/lib/isEmail';
import isMobile from 'validator/lib/isMobilePhone';
import InplaceInput from '~/comp/inplace-input';
import { useSecretCode } from '~/comp/secretcode';
import Avatar from '~/comp/zoom-avatar';
import userState from "~/state/user";
import { useSetCode } from "~/state/code";
import useTitle from "~/hook/title";
import { get, put } from "~/lib/rest";
import AvatarPicker from './avatar';

// https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function Profile() {
  const { enqueueSnackbar } = useSnackbar();
  const secretCode = useSecretCode();
  const [user, setUser] = useRecoilState(userState);

  useTitle('个人资料');
  useSetCode(0);

  // 修改姓名
  const onChangeName = async value => {
    try {
      await put('/user/name', new URLSearchParams({ name: value }));
      setUser({ ...user, name: value, });
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 修改登录名
  const onChangeUserid = async value => {
    try {
      const token = await secretCode();

      await put('/user/userid', new URLSearchParams({
        secretcode_token: token, userid: value
      }));
      setUser({ ...user, userid: value, });
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 修改邮箱地址
  const onChangeEmail = async value => {
    try {
      if (!isEmail(value)) {
        return enqueueSnackbar('请输入正确邮箱地址', { variant: 'warning' });
      }
      const token = await secretCode();

      await put('/user/email', new URLSearchParams({
        secretcode_token: token, email: value
      }));
      setUser({ ...user, email: value, });
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 修改手机号
  const onChangeMobile = async value => {
    try {
      if (!isMobile(value, 'zh-CN')) {
        return enqueueSnackbar('请输入正确手机号', { variant: 'warning' });
      }
      const token = await secretCode();

      await put('/user/mobile', new URLSearchParams({
        secretcode_token: token, mobile: value
      }));
      setUser({ ...user, mobile: value, });
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  // 修改联系地址
  const onChangeAddress = async value => {
    try {
      const token = await secretCode();

      await put('/user/address', new URLSearchParams({
        secretcode_token: token, address: value,
      }));
      setUser({ ...user, address: value, });
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ mt: 4, px: 4, py: 3 }}>
        <Stack direction='row' spacing={3}>
          <Stack spacing={1}>
            <Avatar avatar={user?.avatar} name={user?.name}
              sx={{ width: 96, height: 96 }}
            />
            <AvatarPicker />
          </Stack>
          <Stack spacing={2} width='100%'>
            <Stack direction='row'>
              <Stack sx={{ flex: 1 }}>
                <InplaceInput variant='h6' sx={{ flex: 1 }} text={user?.name}
                  onConfirm={onChangeName}
                />
                <Stack direction='row' alignItems='baseline'>
                  <Typography sx={{ mr: '2px' }} color='primary'>@</Typography>
                  <InplaceInput sx={{ flex: 1 }} text={user?.userid}
                    onConfirm={onChangeUserid}
                  />
                </Stack>
              </Stack>
              <Stack direction='row' spacing={2}>
                <Button LinkComponent={RouteLink} to='/user/password'>
                  修改密码
                </Button>
                <Button LinkComponent={RouteLink} to='/user/security'>
                  安全设置
                </Button>
                <Button LinkComponent={RouteLink} to='/user/oauth'>
                  身份授权
                </Button>
              </Stack>
            </Stack>
            <Divider />
            <Stack direction='row' spacing={1} alignItems='center'>
              <Tooltip title='邮箱地址'>
                <EmailIcon fontSize='small' color='primary' />
              </Tooltip>
              <InplaceInput sx={{ flex: 1 }} text={user?.email || ''}
                variant='body2' onConfirm={onChangeEmail}
              />
            </Stack>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Tooltip title='手机号码'>
                <PhoneIcon fontSize='small' color='primary' />
              </Tooltip>
              <InplaceInput sx={{ flex: 1 }} text={user?.mobile || ''}
                variant='body2' maxLength={11} onConfirm={onChangeMobile}
              />
            </Stack>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Tooltip title='联系地址'>
                <LocationOnIcon fontSize='small' color='primary' />
              </Tooltip>
              <InplaceInput sx={{ flex: 1 }} text={user?.address || ''}
                variant='body2' onConfirm={onChangeAddress}
              />
            </Stack>
          </Stack>
        </Stack>
        <Stack sx={{ mt: 4 }}>
          <Typography variant='h6'>访问设备</Typography>
          <Typography variant='caption'>
            您曾经使用下列的设备登录系统，如果有不认识的设备，说明您的账号极大可能被盗用，
            请联系管理员进行排查
          </Typography>
        </Stack>
        <Devices />
        <Stack sx={{ mt: 3 }}>
          <Typography variant='h6'>访问地图</Typography>
          <Typography variant='caption'>
            您曾经在下列位置登录系统，位置信息通过 IP 获取，可能存在误差
          </Typography>
        </Stack>
        <Map />
        <Typography variant='caption'>
          <Link component={RouteLink} to='../signinlist' underline='hover'>
            查看我的登录历史
          </Link>
        </Typography>
      </Paper>
    </Container>
  )
}

// 访问设备列表
function Devices() {
  const { enqueueSnackbar } = useSnackbar();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/user/devices');
        setDevices(resp.devices || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {devices.map((item, index) => (
          <Grid key={index} item xs={4}>
            <Paper variant='outlined' sx={{ p: 2 }}>
              <Stack direction='row' spacing={1} alignItems='flex-end'
                justifyContent='center'>
                <BrowserIcon browser={item.browser} />
              </Stack>
              <Stack sx={{ mt: 1 }}>
                <Typography variant='caption' sx={{ textAlign: 'center' }}>
                  {item.browser} on {item.os}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <FormHelperText>
        访问设备通过浏览器的 User Agent 识别，系统仅使用这些信息增强安全，
        不与任何第三方共享，详情请参考
        <Link component='a' href='/privacy' target='_blank' underline='hover'>
          《隐私政策》
        </Link>
      </FormHelperText>
    </Paper>
  )
}

// 浏览器图标
function BrowserIcon(props) {
  let icon, title, color;

  switch (props.browser?.toLowerCase()) {
    case 'chrome':
      icon = mdiGoogleChrome;
      title = 'Chrome 浏览器';
      color = '#019934';
      break;
    case 'firefox':
      icon = mdiFirefox;
      title = 'Firefox 浏览器';
      color = '#f62336';
      break;
    case 'edge':
      icon = mdiMicrosoftEdge;
      title = 'Microsoft Edge 浏览器';
      color = '#3277BC';
      break;
    case 'safari':
      icon = mdiAppleSafari;
      title = 'Apple Safari 浏览器';
      color = '#0FB5EE';
      break;
    case 'opera':
      icon = mdiOpera;
      title = 'Opera 浏览器';
      color = 'red';
      break;
    default:
      icon = null;
      break;
  }
  if (!icon) {
    return null;
  }
  return (
    <Tooltip title={title} arrow placement='top'>
      <Icon path={icon} size={1.5} color={color} />
    </Tooltip>
  )
}

// 访问地图
function Map() {
  const { enqueueSnackbar } = useSnackbar();
  const [geo, setGeo] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/user/geo');
        setGeo(resp.geo || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Typography variant='button' paragraph>
        {geo.map((item, index) => (
          <span key={item.name}>
            {item.name}{index < geo.length - 1 ? '，' : ''}
          </span>
        ))}
      </Typography>
      <MapContainer
        center={[38.02360535, 15.09230423]}
        zoom={2}
        minZoom={1}
        dragging={true}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
        style={{ height: 500, borderRadius: 4 }}>
        <TileLayer
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geo.map(item => (
          <Marker key={item.name} position={[item.latitude, item.longitude]}>
            <Popup>{item.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <FormHelperText>
        IP 地址通过网络连接获取，地理位置通过 IP 查询而来，这些信息用于增强安全，
        不与任何第三方分享，详情请参考
        <Link component='a' href='/privacy' target='_blank' underline='hover'>
          《隐私政策》
        </Link>
      </FormHelperText>
    </Paper>
  )
}
