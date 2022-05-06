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

// 发送测试邮件
export default function Test(props) {
  const { enqueueSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);
  const [disabled, setDisabled] = useState(false);

  const { open, onClose, mta } = props;

  const onConfirm = async () => {
    try {
      setDisabled(true);

      const _audit = `通过邮件服务 ${mta.name} 发送测试邮件`;

      await post('/system/setting/mail/test', new URLSearchParams({
        uuid: mta.uuid, email: user?.email, _audit,
      }));
      enqueueSnackbar('邮件已发送', { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setDisabled(false);
    }
  }

  return (
    <Dialog open={open} maxWidth='xs'>
      <DialogTitle>发送测试邮件</DialogTitle>
      <DialogContent>
        <DialogContentText>通过 <em>{mta.name}</em> 发送测试邮件</DialogContentText>
        <FormHelperText sx={{ mt: 1 }}>
          点击「发送」按钮将发送一封测试邮件到下面的邮箱地址，成功收到邮件表明邮件服务配置正确
        </FormHelperText>
        <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
          <Typography variant="subtitle2">{user?.email}</Typography>
        </Paper>
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
