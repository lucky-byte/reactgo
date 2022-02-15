import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import Link from '@mui/material/Link';
import { useSnackbar } from 'notistack';
import InplaceInput from '~/comp/inplace-input';
import { get, put } from "~/rest";

export default function GeoIP() {
  const { enqueueSnackbar } = useSnackbar();
  const [webkey, setWebKey] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/settings/geoip/config');
        setWebKey(resp.webkey);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  // 修改 web 服务 key
  const onChangeWebKey = async key => {
    try {
      await put('/system/settings/geoip/webkey', new URLSearchParams({ key }));
      setWebKey(key);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <FormHelperText sx={{ textAlign: 'center', mt: 1 }}>
        配置前请先注册高德开放平台账号，注册地址:&nbsp;
        <Link component='a' href='https://console.amap.com' target='_blank'>
          https://console.amap.com
        </Link>
      </FormHelperText>
      <FormHelperText sx={{ mt: 3 }}>
        可以在高德开放平台
        <Link component='a' target='_blank'
          href='https://console.amap.com/dev/key/app'>
          应用列表
        </Link>
        中查询 KEY，如果没有则需要创建
      </FormHelperText>
      <Paper variant="outlined" sx={{ p: 2, }}>
        <Stack direction='row' alignItems='center'>
          <Typography sx={{ minWidth: 120 }} variant='subtitle2'>
            WEB 服务 KEY:
          </Typography>
          <InplaceInput sx={{ flex: 1 }} text={webkey} placeholder='请填写'
            color="primary" onConfirm={onChangeWebKey}
          />
        </Stack>
      </Paper>
    </Stack>
  )
}
