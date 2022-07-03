import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from '@mui/material/Link';
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import Switch from '@mui/material/Switch';
import Collapse from "@mui/material/Collapse";
import { useSnackbar } from 'notistack';
import InplaceInput from '~/comp/inplace-input';
import useTitle from "~/hook/title";
import progressState from '~/state/progress';
import { get, put } from "~/lib/rest";
import { useGeoipTab } from '../tabstate';

export default function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const [amapEnable, setAMapEnable] = useState(false);
  const [amapWebKey, setAMapWebKey] = useState('');
  const [tencentEnable, setTencentEnable] = useState(false);
  const [tencentWebKey, setTencentWebKey] = useState('');

  useTitle('定位服务');
  useGeoipTab();

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/system/setting/geoip/');
        setAMapWebKey(resp.amap_webkey || '');
        setAMapEnable(resp.amap_enable || false);
        setTencentWebKey(resp.tencent_webkey || '');
        setTencentEnable(resp.tencent_enable || false);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  // 修改高德 web 服务 key
  const onAMapWebKeyChange = async key => {
    try {
      const _audit = '修改高德定位的 Web Key';

      await put('/system/setting/geoip/amap-webkey', new URLSearchParams({
        key, _audit,
      }));
      setAMapWebKey(key);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 启用/停用高德定位
  const onAMapEnableChange = async e => {
    try {
      const enable = e.target.checked;
      const _audit = `${enable ? '启用' : '停用'} 高德定位`;

      await put('/system/setting/geoip/amap-enable', new URLSearchParams({
        enable, _audit,
      }));
      setAMapEnable(enable);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 修改腾讯 web 服务 key
  const onTencentWebKeyChange = async key => {
    try {
      const _audit = '修改腾讯定位的 Web Key';

      await put('/system/setting/geoip/tencent-webkey', new URLSearchParams({
        key, _audit,
      }));
      setTencentWebKey(key);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 启用/停用腾讯定位
  const onTencentEnableChange = async e => {
    try {
      const enable = e.target.checked;
      const _audit = `${enable ? '启用' : '停用'} 腾讯定位`;

      await put('/system/setting/geoip/tencent-enable', new URLSearchParams({
        enable, _audit,
      }));
      setTencentEnable(enable);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <Typography variant='h4'>定位服务</Typography>
      <Typography variant='body2'>
        定位服务通过用户访问 IP 地址推断所在省市，可以同时启用多个定位服务，
        系统将按照页面中的顺序依次使用
      </Typography>
      <Typography variant="h6" sx={{ mt: 4 }}>高德定位服务</Typography>
      <FormHelperText>
        配置前请先注册高德开放平台账号，注册地址:&nbsp;
        <Link href='https://console.amap.com' target='_blank'>
          https://console.amap.com
        </Link>
      </FormHelperText>
      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography>启用高德定位服务</Typography>
          <Switch checked={amapEnable} onChange={onAMapEnableChange}
            inputProps={{ 'aria-label': '启用或禁用高德定位服务' }}
          />
        </Stack>
        <Collapse in={amapEnable}>
          <Stack direction='row' alignItems='center' mt={2}>
            <Typography sx={{ minWidth: 160 }} variant='subtitle2'>
              WEB 服务 KEY:
            </Typography>
            <InplaceInput sx={{ flex: 1 }} text={amapWebKey} secret
              placeholder='请填写' color="primary" onConfirm={onAMapWebKeyChange}
            />
          </Stack>
          <FormHelperText sx={{ mt: 1 }}>
            服务 KEY 是访问高德服务的密钥，你可以在高德开放平台
            <Link component='a' target='_blank'
              href='https://console.amap.com/dev/key/app'>
              应用列表
            </Link>
            中查询或创建
          </FormHelperText>
        </Collapse>
      </Paper>
      <Typography variant="h6" sx={{ mt: 4 }}>腾讯定位服务</Typography>
      <FormHelperText>
        配置前请先注册腾讯位置服务，注册地址:&nbsp;
        <Link href='https://lbs.qq.com' target='_blank'>https://lbs.qq.com</Link>
      </FormHelperText>
      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography>启用腾讯定位服务</Typography>
          <Switch checked={tencentEnable} onChange={onTencentEnableChange}
            inputProps={{ 'aria-label': '启用或禁用腾讯定位服务' }}
          />
        </Stack>
        <Collapse in={tencentEnable}>
          <Stack direction='row' alignItems='center' mt={2}>
            <Typography sx={{ minWidth: 160 }} variant='subtitle2'>
              WebServiceAPI KEY:
            </Typography>
            <InplaceInput sx={{ flex: 1 }} text={tencentWebKey} secret
              placeholder='请填写' color="primary" onConfirm={onTencentWebKeyChange}
            />
          </Stack>
          <FormHelperText sx={{ mt: 1 }}>
            WebServiceAPI KEY 是访问腾讯位置服务的密钥，你可以在腾讯位置服务
            <Link component='a' target='_blank'
              href='https://lbs.qq.com/dev/console/application/mine'>
              我的应用
            </Link>
            中查询或创建
          </FormHelperText>
        </Collapse>
      </Paper>
    </Stack>
  )
}
