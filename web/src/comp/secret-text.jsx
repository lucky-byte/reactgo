import { useState } from "react";
import Stack from "@mui/material/Stack"
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography"
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSecretCode } from './secretcode';

export default function SecretText(props) {
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
    <Stack direction='row'>
      <Typography {...others}>{hide ? '········' : text}</Typography>
      <IconButton aria-label="显示" color="warning" onClick={onHideClick} sx={{
        padding: 0, marginLeft: 1,
      }}>
        {hide ?
          <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />
        }
      </IconButton>
    </Stack>
  )
}
