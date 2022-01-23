import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Switch from '@mui/material/Switch';
import FormHelperText from "@mui/material/FormHelperText";
import { useSnackbar } from 'notistack';
import { get, put } from "../../../rest";

export default function Secure() {
  const { enqueueSnackbar } = useSnackbar();
  const [resetPass, setResetPass] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/settings/secure');
        setResetPass(resp.resetpass);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  // 允许用户找回密码
  const onResetPassCheck = async () => {
    try {
      await put('/system/settings/secure/resetpass', new URLSearchParams({
        resetpass: !resetPass
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setResetPass(!resetPass);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <Paper variant="outlined" sx={{ py: 1, px: 2, mt: 2 }}>
        <Stack direction='row' alignItems='center'>
          <Stack sx={{ flex: 1 }}>
            <Typography>登录时允许用户找回密码</Typography>
            <FormHelperText>
              如果不允许，需要管理员登录后台重置用户密码
            </FormHelperText>
          </Stack>
          <Switch checked={resetPass} onChange={onResetPassCheck} />
        </Stack>
      </Paper>
    </Stack>
  )
}
