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
import { post } from "~/rest";

// 发送测试邮件
export default function Test(props) {
  const { enqueueSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);
  const [disabled, setDisabled] = useState(false);

  const { open, onClose, name, uuid } = props;

  const onConfirm = async () => {
    try {
      setDisabled(true);

      await post('/system/setting/mail/test', new URLSearchParams({
        uuid, email: user?.email,
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
    <Dialog open={open} onClose={onClose} maxWidth='xs' disableEscapeKeyDown>
      <DialogTitle>发送测试邮件</DialogTitle>
      <DialogContent>
        <DialogContentText>通过 <em>{name}</em> 发送测试邮件</DialogContentText>
        <FormHelperText sx={{ mt: 1 }}>
          点击「发送」将发送一封测试邮件到下面的邮箱地址，成功收到邮件表明配置正确
        </FormHelperText>
        <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
          <Typography variant="body2">{user?.email}</Typography>
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
