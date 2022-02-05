import { useEffect, useState, useMemo } from "react";
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
import { debounce } from "lodash";

export default function InplaceInput(props) {
  const [text, setText] = useState(props.text);
  const [iconVisible, setIconVisible] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setText(props.text); }, [props.text])

  const onEditClick = () => {
    setEditing(true);
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

  const onCancelClick = () => {
    setEditing(false);
    setIconVisible(false);
  }

  const onConfirmClick = () => {
    if (text !== props.text) {
      props.onConfirm(text);
      setText(props.text);
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <Stack direction='row' alignItems='flex-start' sx={props.sx}>
        <TextField variant='standard' size="small" fullWidth={props.fullWidth}
          multiline={props.multiline} autoFocus
          value={text} onChange={onTextChange} onKeyDown={onKeyDown}
          onBlur={debounceBlur}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <Stack direction='row'>
                  <Tooltip title='取消修改'>
                    <IconButton aria-label="取消" onClick={onCancelClick}>
                      <CancelIcon fontSize="small" color='warning' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip aria-label="确定修改" title='确定修改'>
                    <IconButton onClick={onConfirmClick}>
                      <CheckCircleIcon fontSize="small" color='success' />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </InputAdornment>
          }}
          inputProps={{
            style: {
              fontSize: props.fontSize,
            },
            maxLength: props.maxLength,
          }}
        />
      </Stack>
    )
  }

  return (
    <Stack direction='row' alignItems='center' sx={props.sx}>
      {props.text ?
        <Typography variant={props.variant} onClick={onEditClick}
          onMouseEnter={() => { setIconVisible(true); }}
          onMouseLeave={() => { setIconVisible(false); }}
          color={props.color} sx={{ cursor: 'pointer' }}>
          {props.text}
        </Typography>
        :
        <Typography variant={props.variant} onClick={onEditClick}
          onMouseEnter={() => { setIconVisible(true); }}
          onMouseLeave={() => { setIconVisible(false); }}
          sx={{ cursor: 'pointer', color: '#8888' }}>
          {props.placeholder}
        </Typography>
      }
      <IconButton aria-label='修改' onClick={onEditClick} sx={{
        display: iconVisible ? 'visible' : 'none', padding: 0, marginLeft: '4px',
      }}>
        <EditIcon sx={{ fontSize: '14px' }} color='primary' />
      </IconButton>
    </Stack>
  )
}

InplaceInput.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  text: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]),
  variant: PropTypes.string,
  multiline: PropTypes.bool,
  sx: PropTypes.object,
  fontSize: PropTypes.string,
  fullWidth: PropTypes.bool,
  placeholder: PropTypes.string,
  color: PropTypes.string,
  maxLength: PropTypes.number,
}

InplaceInput.defaultProps = {
  variant: 'body1',
  multiline: false,
  sx: {},
  fontSize: 'normal',
  fullWidth: true,
  placeholder: '空',
  color: '',
  maxLength: 1000,
}
