import { useState, forwardRef } from "react";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField"
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSecretCode } from './secretcode';

export default forwardRef(function SecretInput(props, ref) {
  const secretCode = useSecretCode();
  const [hide, setHide] = useState(true);

  const { text, ...others } = props;

  const onHideClick = async () => {
    try {
      if (hide) {
        await secretCode();
      }
      setHide(!hide);
    } catch (err) {
      if (err) {
        console.error(err.message);
      }
    }
  }

  return (
    <TextField ref={ref} {...others} type={hide ? 'password' : 'text'}
      InputProps={{
        endAdornment:
          <InputAdornment position='end'>
            <IconButton color="warning" onClick={onHideClick} size='small'>
              {hide ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </InputAdornment>
      }}
    />
  )
});
