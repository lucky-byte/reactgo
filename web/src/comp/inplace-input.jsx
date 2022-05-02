import { useEffect, useState, useMemo } from "react";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSecretCode } from './secretcode';

export default function InplaceInput(props) {
  const secretCode = useSecretCode();
  const [text, setText] = useState(props.text);
  const [hide, setHide] = useState(props.secret);
  const [iconVisible, setIconVisible] = useState(false);
  const [editing, setEditing] = useState(false);

  const {
    required, variant, placeholder, disabled, color, fontSize, maxLength, secret,
  } = props;

  useEffect(() => { setText(props.text); }, [props.text])

  const onEditClick = () => {
    if (!disabled) {
      setEditing(true);
    }
  }

  const onTextChange = e => {
    setText(e.target.value);
  }

  const onKeyDown = e => {
    if (e.key === 'Escape') {
      return onCancelClick();
    }
    if (!props.multiline && e.key === 'Enter') {
      onConfirmClick();
    }
  }

  const debounceBlur = useMemo(() => debounce(() => { onCancelClick(); }, 200), []);
  useEffect(() => { return () => { debounceBlur.cancel(); } }, [debounceBlur]);

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

  const onCancelClick = () => {
    setEditing(false);
    setIconVisible(false);
  }

  const onConfirmClick = () => {
    if (required && !text) {
      return;
    }
    if (text !== props.text) {
      props.onConfirm(text);
      setText(props.text);
    }
    setEditing(false);
    setIconVisible(false);
  }

  if (editing) {
    return (
      <Stack direction='row' alignItems='flex-start' sx={props.sx}>
        <TextField variant='standard' size="small" fullWidth={props.fullWidth}
          required={required}
          type={hide ? 'password' : 'text'}
          autoComplete='new-password'
          multiline={props.multiline} autoFocus
          value={text} onChange={onTextChange} onKeyDown={onKeyDown}
          onBlur={debounceBlur}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <Stack direction='row'>
                  <Tooltip title='取消修改' arrow>
                    <IconButton aria-label="取消" onClick={onCancelClick}>
                      <CancelIcon fontSize="small" color='warning' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='确定修改' arrow>
                    <IconButton onClick={onConfirmClick}>
                      <CheckCircleIcon fontSize="small" color='success' />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </InputAdornment>
          }}
          inputProps={{
            style: {
              fontSize: fontSize,
            },
            maxLength: maxLength,
          }}
        />
      </Stack>
    )
  }

  return (
    <Stack direction='row' alignItems='center' sx={props.sx}>
      {props.text ?
        <Typography variant={variant} onClick={onEditClick}
          onMouseEnter={() => { setIconVisible(true); }}
          onMouseLeave={() => { setIconVisible(false); }}
          color={disabled ? '#8888' : color}
          sx={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          {hide ? '········' : props.text}
        </Typography>
        :
        <Typography variant={variant} onClick={onEditClick}
          onMouseEnter={() => { setIconVisible(true); }}
          onMouseLeave={() => { setIconVisible(false); }}
          color='#8888'
          sx={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          {placeholder}
        </Typography>
      }
      {!disabled &&
        <EditIcon color="primary" sx={{
          display: iconVisible ? 'visible' : 'none', marginLeft: '2px',
          fontSize: '14px',
        }} />
      }
      <IconButton aria-label="显示" color="warning" onClick={onHideClick} sx={{
        display: secret ? 'visible' : 'none', padding: 0, marginLeft: 1,
      }}>
        {hide ?
          <VisibilityIcon fontSize="small" /> :
          <VisibilityOffIcon fontSize="small" />
        }
      </IconButton>
    </Stack>
  )
}

InplaceInput.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  text: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]),
  required: PropTypes.bool,
  variant: PropTypes.string,
  multiline: PropTypes.bool,
  sx: PropTypes.object,
  fontSize: PropTypes.string,
  fullWidth: PropTypes.bool,
  placeholder: PropTypes.string,
  color: PropTypes.string,
  maxLength: PropTypes.number,
  disabled: PropTypes.bool,
  secret: PropTypes.bool,
}

InplaceInput.defaultProps = {
  required: true,
  variant: 'body1',
  multiline: false,
  sx: {},
  fontSize: 'normal',
  fullWidth: true,
  placeholder: '空',
  color: '',
  maxLength: 1000,
  disabled: false,
  secret: false,
}
