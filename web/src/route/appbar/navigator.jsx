import { useState, useRef, forwardRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from "@mui/material/FormHelperText";
import Link from "@mui/material/Link";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useSnackbar } from 'notistack';
import isInt from "validator/lib/isInt";
import urlCodes from "../sidebar/codes";

const SlideTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

// 快速导航
export default function Navigator(props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [codeInput, setCodeInput] = useState('');
  const [message, setMessage] = useState('');

  const { open, setOpen } = props;

  const inputRef = useRef();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);

      return () => { clearTimeout(timer); }
    }
  }, [open]);

  const onClose = () => {
    setCodeInput('');
    setMessage('');
    setOpen(false);
  }

  const onCodeChange = e => {
    const v = e.target.value;

    if (v.length === 0 || isInt(v)) {
      setMessage('');
      setCodeInput(v);
    }
  }

  const onKeyDown = e => {
    if (e.key !== 'Enter') {
      return;
    }
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (codeInput.length < 3) {
      return;
    }
    try {
      const codeVal = parseInt(codeInput);
      const item = urlCodes[codeVal];
      if (item && item.to) {
        onClose();
        navigate(item.to);
      } else {
        setCodeInput('');
        setMessage(`代码 ${codeInput} 不存在，请重新输入`);
      }
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  }

  const onViewCodes = () => {
    onClose();
    navigate('/codes');
  }

  return (
    <Dialog open={open} onClose={onClose} TransitionComponent={SlideTransition}
      PaperProps={{ sx: { alignSelf: 'flex-start' } }}>
      <DialogContent>
        <TextField focused autoFocus label="导航码" variant="outlined"
          inputRef={inputRef}
          placeholder="3到4位数字，回车确定"
          InputProps={{
            endAdornment:
              <InputAdornment position="end"><KeyboardReturnIcon /></InputAdornment>
          }}
          inputProps={{ maxLength: 4 }}
          value={codeInput} onChange={onCodeChange} onKeyDown={onKeyDown}
        />
        {message ?
          <FormHelperText error>{message}</FormHelperText>
          :
          <FormHelperText>
            <Link component='button' variant='caption' underline='none'
              onClick={onViewCodes}>
              输入 '911' 查看所有导航码
            </Link>
          </FormHelperText>
        }
      </DialogContent>
    </Dialog>
  )
}
