import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckIcon from '@mui/icons-material/CheckCircle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useSnackbar } from 'notistack';
import SecretInput from '~/comp/secret-input';
import progressState from '~/state/progress';
import { get, put } from "~/lib/rest";

export default function Github() {
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [secret, setSecret] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/system/setting/account/oauth/github');
        setClientId(resp.clientid);
        setSecret(resp.secret);
        setEnabled(resp.enabled);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  // 打开设置
  const onSettingOpen = () => {
    setOpen(true);
  }

  // 关闭设置
  const onSettingClose = () => {
    setOpen(false);
  }

  const onClientIdChange = e => {
    setClientId(e.target.value);
  }

  const onClientSecretChange = e => {
    setSecret(e.target.value);
  }

  const onEnableCheck = e => {
    setEnabled(e.target.checked);
  }

  const onSubmit = async () => {
    try {
      if (!clientId || !secret) {
        return enqueueSnackbar('录入数据不完整', { variant: 'info' });
      }
      const _audit = `修改 GitHub 身份授权配置`;

      await put('/system/setting/account/oauth/github', new URLSearchParams({
        clientid: clientId, secret, enabled, _audit,
      }));
      onSettingClose();
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <>
      <Stack direction='row' alignItems='center' sx={{ px: 2, py: 3 }}>
        <Stack direction='row' spacing={2} alignItems='center' flex={1}>
          <GitHubIcon fontSize='large' />
          <Stack>
            <Stack direction='row' alignItems='center' spacing={3}>
              <Typography variant='h6'>GitHub</Typography>
              {enabled &&
                <Chip icon={<CheckIcon />}
                  label='已启用' size="small" variant="outlined" color="success"
                />
              }
            </Stack>
            <Typography variant='caption'>允许用户使用 GitHub 账号登录本系统</Typography>
          </Stack>
        </Stack>
        <Button variant='contained' disableElevation onClick={onSettingOpen}>
          设置
        </Button>
      </Stack>
      <Dialog open={open} onClose={onSettingClose} maxWidth='sm' fullWidth>
        <DialogTitle>GitHub 授权设置</DialogTitle>
        <DialogContent>
          <Typography variant="body2">请输入您的 GitHub 客户端 ID 和客户端密钥</Typography>
          <Paper variant='outlined' sx={{ px: 4, pt: 3, pb: 2, my: 2 }}>
            <TextField fullWidth variant="standard" required
              label="客户端 ID"
              placeholder="GitHub Client ID"
              value={clientId} onChange={onClientIdChange}
            />
            <SecretInput fullWidth variant="standard" margin='normal' required
              label="客户端密钥"
              placeholder="GitHub Client Secret"
              value={secret} onChange={onClientSecretChange}
              autoComplete='new-password'
            />
            <FormControlLabel sx={{ mt: 1 }} label="启用 GitHub 身份授权" control={
              <Checkbox checked={enabled} onChange={onEnableCheck} />
            } />
          </Paper>
          <Typography variant="caption" component='p' color='gray'>
            如果还没有客户端 ID 和密钥，可以从
            <Link href='https://github.com/settings/developers' target='_blank'
              underline="hover">
              &nbsp;GitHub OAuth Apps&nbsp;
            </Link>
            获取。在创建 GitHub OAuth App 时，授权回调 URL(Authorization
            callback URL)请填写为：&lt;域&gt;<strong>/oauth/github/callback</strong>
            ，例如：<em>https://my-domain-name:3456/oauth/github/callback</em>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color='secondary' onClick={onSettingClose}>取消</Button>
          <Button variant="contained" onClick={onSubmit}>确定</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
