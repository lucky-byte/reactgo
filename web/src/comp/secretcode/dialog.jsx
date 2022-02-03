import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Zoom from '@mui/material/Zoom';
import Collapse from '@mui/material/Collapse';
import PinInput from '~/comp/pin-input';
import { put } from '~/rest';
import { FormHelperText } from '@mui/material';

const SecretCodeDialog = ({ open, onSuccess, onClose, inputFocus }) => {
  const [hide, setHide] = useState(true);
  const [focus, setFocus] = useState(true);
  const [clear, setClear] = useState(Math.random());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // 重新打开对话框时，设置输入焦点
  useEffect(() => { setFocus(open); }, [open]);

  const reset = () => {
    setMessage('');
    setSuccess(false);
  }

  const onDialogClose = () => {
    reset();
    onClose();
  }

  const onChange = code => {
    if (code.length < 6) {
      setMessage('');
      setSuccess(false);
      setFocus(false);
    }
  }

  const onVerify = async code => {
    try {
      setLoading(true);

      const resp = await put('/secretcode/verify', new URLSearchParams({
        secretcode: code,
      }));
      if (!resp) {
        throw new Error('响应无效');
      }
      setSuccess(true);
      setTimeout(() => { onSuccess(resp); reset(); }, 200);
    } catch (err) {
      setLoading(false);
      setClear(Math.random());
      setFocus(true);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onDialogClose}>
      {loading && <LinearProgress color='secondary' sx={{ width: '100%' }} />}
      <DialogTitle>
        <Stack>
          <Typography variant='h6'>
            验证安全操作码
          </Typography>
          <Typography variant='caption'>
            该操作可能存在风险，需要验证您的安全操作码后才能继续执行
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack alignItems='center' spacing={2} sx={{ mt: 2 }}>
          <DialogContentText>请输入安全操作码</DialogContentText>
          <PinInput hide={hide} focus={focus} clear={clear} disabled={loading}
            onChange={onChange} onComplete={onVerify}
          />
          <Collapse in={message.length > 0}>
            <Typography color='error' variant='body2'>{message || ''}</Typography>
          </Collapse>
          {success &&
            <Zoom in={success}>
              <Typography variant='body1' sx={{ color: 'green' }}>
                验证通过
              </Typography>
            </Zoom>
          }
          <IconButton onClick={() => { setHide(!hide) }}>
            {hide ?
              <VisibilityIcon color='primary' />
              :
              <VisibilityOffIcon color='secondary' />
            }
          </IconButton>
          <FormHelperText>忘记了安全操作码？请联系管理员帮您重置</FormHelperText>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default SecretCodeDialog;
