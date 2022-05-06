import { useState } from "react";
import { useRecoilValue } from "recoil";
import Paper from "@mui/material/Paper";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useSnackbar } from 'notistack';
import userState from '~/state/user';
import { post } from "~/lib/rest";

// 发送测试短信
export default function Test(props) {
  const { enqueueSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);
  const [disabled, setDisabled] = useState(false);

  const { open, onClose, sms } = props;
  const code = '112233';

  const onConfirm = async () => {
    try {
      setDisabled(true);

      const _audit = `通过短信服务 ${sms.isp_name} 发送测试短信`;

      await post('/system/setting/sms/test', new URLSearchParams({
        uuid: sms.uuid, mobile: user?.mobile, code: code, _audit,
      }));
      enqueueSnackbar('短信已发送', { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setDisabled(false);
    }
  }

  return (
    <Dialog open={open} maxWidth='xs'>
      <DialogTitle>发送测试短信</DialogTitle>
      <DialogContent>
        <DialogContentText>通过 <em>{sms.isp_name}</em> 发送测试短信</DialogContentText>
        <FormHelperText sx={{ mt: 1 }}>
          点击「发送」按钮将发送一条验证码为 {code} 的短信到下面的手机号，成功收到短信表明配置正确
        </FormHelperText>
        <Paper variant="outlined" sx={{ p: 1, my: 1 }}>
          <Typography variant="subtitle2">{user?.mobile}</Typography>
        </Paper>
        <FormHelperText>发送短信将产生运营商费用，请知悉</FormHelperText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" disabled={disabled} onClick={onConfirm}>
          发送
        </Button>
      </DialogActions>
    </Dialog>
  )
}
