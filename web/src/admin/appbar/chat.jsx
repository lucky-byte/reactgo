import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';

export default function Chat() {
  return (
    <>
      <Tooltip title='常联络' arrow>
        <IconButton aria-label="联络" color="primary">
          <PhoneForwardedIcon />
        </IconButton>
      </Tooltip>
    </>
  )
}
