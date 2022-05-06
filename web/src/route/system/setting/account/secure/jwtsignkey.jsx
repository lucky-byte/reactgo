import { useState } from "react";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Typography from "@mui/material/Typography";
import { useSnackbar } from 'notistack';
import { useSecretCode } from '~/comp/secretcode';
import { put } from "~/lib/rest";

export default function JWTSignKeyButton(props) {
  const { enqueueSnackbar } = useSnackbar();
  const secretCode = useSecretCode();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState(1);

  const { setJWTSignKey } = props;

  const onOpen = () => {
    setOpen(true);
  }

  const onClose = () => {
    setMethod(1);
    setOpen(false);
  }

  const onMethodChange = e => {
    setMethod(e.target.value);
  }

  const onJWTSignKeyChange = async () => {
    try {
      const token = await secretCode();

      const _audit = `更换登录会话签名密钥`;

      const resp = await put('/system/setting/account/secure/jwtsignkey',
        new URLSearchParams({ method, secretcode_token: token, _audit, })
      );
      setJWTSignKey(resp);
      enqueueSnackbar('更新成功', { variant: 'success' });
      onClose();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <>
      <Button variant='contained' color='warning' onClick={onOpen} disableElevation>
        更换
      </Button>
      <Dialog onClose={onClose} open={open} maxWidth='xs' fullWidth>
        <DialogTitle>更换签名密钥</DialogTitle>
        <DialogContent>
          <Typography variant="body2">请选择密钥处理方式：</Typography>
          <FormControl sx={{ width: '100%', mt: 1 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <RadioGroup aria-labelledby="请选择密钥处理方式"
                value={method} onChange={onMethodChange}>
                <FormControlLabel value={1} control={<Radio />}
                  label={
                    <>
                      <Typography variant="button">新旧密钥同时可用</Typography>
                      <Typography component='p' variant="caption">
                        已登录用户凭证依旧有效，新登录凭证采用新密钥签名
                      </Typography>
                    </>
                  }
                />
                <FormControlLabel value={2} control={<Radio />} sx={{ mt: 3 }}
                  label={
                    <>
                      <Typography variant="button">旧密钥立即失效</Typography>
                      <Typography component='p' variant="caption">
                        所有已登录用户凭证立即失效，需重新登录签发新凭证
                      </Typography>
                    </>

                  }
                />
              </RadioGroup>
            </Paper>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ mx: 3, mb: 2 }}>
          <Button onClick={onClose}>取消</Button>
          <Button variant='contained' color='warning' onClick={onJWTSignKeyChange}>
            更换
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
