import { useTheme } from '@mui/material/styles';
import Avatar from "@mui/material/Avatar";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export default function ZoomAvatar(props) {
  const theme = useTheme();
  const { avatar, name, ...others } = props;

  let url = avatar || '';

  if (url && !url.startsWith('http')) {
    url = `/image/?u=${url}`;
  }

  let overlayBgColorStart = 'rgba(255, 255, 255, 0)';
  let overlayBgColorEnd = 'rgba(255, 255, 255, 0.9)';

  if (theme.palette.mode === 'dark') {
    overlayBgColorStart = 'rgba(0, 0, 0, 0)';
    overlayBgColorEnd = 'rgba(0, 0, 0, 0.9)';
  }

  return (
    <Zoom zoomMargin={10}
      overlayBgColorStart={overlayBgColorStart}
      overlayBgColorEnd={overlayBgColorEnd}>
      <Avatar src={url} alt={name} {...others} />
    </Zoom>
  )
}
