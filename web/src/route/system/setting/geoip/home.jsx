import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from '@mui/material/Link';
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import Switch from '@mui/material/Switch';
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSnackbar } from 'notistack';
import { useSecretCode } from '~/comp/secretcode';
import InplaceInput from '~/comp/inplace-input';
import useTitle from "~/hook/title";
import progressState from '~/state/progress';
import { get, put } from "~/rest";
import { useGeoipTab } from '../tabstate';

export default function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const secretCode = useSecretCode();
  const [amapWebKey, setAMapWebKey] = useState('');
  const [amapWebKeyHide, setAMapWebKeyHide] = useState(true);
  const [amapEnable, setAMapEnable] = useState(false);

  useTitle('定位服务');
  useGeoipTab();

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/system/setting/geoip/');
        setAMapWebKey(resp.amap_webkey || '');
        setAMapEnable(resp.amap_enable || false);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  // 修改 web 服务 key
  const onAMapWebKeyChange = async key => {
    try {
      await put('/system/setting/geoip/amap-webkey', new URLSearchParams({ key }));
      setAMapWebKey(key);
      setAMapWebKeyHide(false);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 显示或隐藏高德 webkey
  const onAMapWebKeyShow = async () => {
    try {
      if (amapWebKeyHide) {
        await secretCode();
      }
      setAMapWebKeyHide(!amapWebKeyHide);
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  const onAMapEnableChange = async e => {
    try {
      const enable = e.target.checked;

      await put('/system/setting/geoip/amap-enable', new URLSearchParams({ enable }));
      setAMapEnable(enable);
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
        <Stack direction='row' alignItems='center'>
          <Typography sx={{ minWidth: 120 }} variant='subtitle2'>
            WEB 服务 KEY:
          </Typography>
          <InplaceInput sx={{ flex: 1 }}
            text={amapWebKeyHide ? '已隐藏，点右边的眼睛查看 >>' : amapWebKey}
            placeholder='请填写' color="primary" onConfirm={onAMapWebKeyChange}
          />
          <IconButton color="primary" onClick={onAMapWebKeyShow}>
            {amapWebKeyHide ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Stack>
        <FormHelperText sx={{ mt: 1 }}>
          可以在高德开放平台
          <Link component='a' target='_blank'
            href='https://console.amap.com/dev/key/app'>
            应用列表
          </Link>
          中查询 KEY，如果没有则需要创建
        </FormHelperText>
        <Divider sx={{ my: 2 }} />
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography>启用高德定位服务</Typography>
          <Switch checked={amapEnable} onChange={onAMapEnableChange}
            inputProps={{ 'aria-label': '启用或禁用高德定位服务' }}
          />
        </Stack>
      </Paper>
      <Typography variant="h6" sx={{ mt: 4 }}>腾讯位置服务</Typography>
    </Stack>
  )
}
