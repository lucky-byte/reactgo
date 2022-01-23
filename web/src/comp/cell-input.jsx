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

export default function CellInput(props) {
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

  const debounceBlur = useMemo(() => debounce(() => { setEditing(false); }, 200), []);
  useEffect(() => { return () => { debounceBlur.cancel(); } }, [debounceBlur]);

  const onCancelClick = () => {
    setEditing(false);
  }

  const onConfirmClick = () => {
    setEditing(false);
    props.onConfirm(text);
  }

  if (editing) {
    return (
      <Stack direction='row' alignItems='flex-start' sx={props.sx}>
        <TextField variant='standard' size="small" autoFocus
          multiline={props.multiline}
          inputProps={{
            style: {
              fontSize: 'small',
            }
          }}
          value={text} onChange={onTextChange} onKeyDown={onKeyDown}
          onBlur={debounceBlur}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <Stack direction='row'>
                  <Tooltip title='取消修改'>
                    <IconButton onClick={onCancelClick}>
                      <CancelIcon fontSize="small" color='warning' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='确定修改'>
                    <IconButton onClick={onConfirmClick}>
                      <CheckCircleIcon fontSize="small" color='success' />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </InputAdornment>
          }}
        />
      </Stack>
    )
  }

  return (
    <Stack direction='row' alignItems='center' sx={props.sx}>
      <Typography variant={props.variant} onClick={onEditClick}
        onMouseEnter={() => { setIconVisible(true); }}
        onMouseLeave={() => { setIconVisible(false); }}
        sx={{ cursor: 'pointer' }}>
        {props.text}
      </Typography>
      <IconButton onClick={onEditClick} sx={{
        display: iconVisible ? 'visible' : 'none', padding: 0, marginLeft: '4px',
      }}>
        <EditIcon sx={{ fontSize: '14px' }} color='primary' />
      </IconButton>
    </Stack>
  )
}

CellInput.propTypes = {
  text: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  variant: PropTypes.string,
  multiline: PropTypes.bool,
  sx: PropTypes.object,
}

CellInput.defaultProps = {
  variant: 'body2',
  multiline: false,
  sx: {},
}
