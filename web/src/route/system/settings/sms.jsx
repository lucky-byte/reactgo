import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import { useSnackbar } from 'notistack';
import InplaceInput from '../../../comp/inplace-input';
import { useEffect, useState } from "react";
import { get, put } from "../../../rest";

export default function SMS() {
  const { enqueueSnackbar } = useSnackbar();
  const [appid, setAppid] = useState('');
  const [appkey, setAppkey] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/settings/sms');
        setAppid(resp.appid);
        setAppkey(resp.appkey);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  const onChangeAppid = async v => {
    try {
      await put('/system/settings/sms/appid', new URLSearchParams({
        appid: v,
      }));
      setAppid(v);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onChangeAppkey = async v => {
    try {
      await put('/system/settings/sms/appkey', new URLSearchParams({
        appkey: v,
      }));
      setAppkey(v);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <FormHelperText sx={{ textAlign: 'center' }}>
        配置前请先注册腾讯短信服务，注册地址：
        <Link component='a'
          href='https://cloud.tencent.com/product/sms' target='_blank'>
          https://cloud.tencent.com/product/sms
        </Link>
      </FormHelperText>
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Stack direction='row'>
          <Typography sx={{minWidth: 70}} variant='subtitle1'>AppId:</Typography>
          <InplaceInput sx={{ flex: 1, ml: 1 }} text={appid}
            onConfirm={onChangeAppid}
          />
        </Stack>
        <Stack direction='row'>
          <Typography sx={{minWidth: 70}} variant='subtitle1'>AppKey:</Typography>
          <InplaceInput sx={{ flex: 1, ml: 1 }} text={appkey}
            onConfirm={onChangeAppkey}
          />
        </Stack>
      </Paper>
    </Stack>
  )
}
