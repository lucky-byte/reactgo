import { useTheme } from '@mui/material/styles';
import Stack from "@mui/material/Stack";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// 图片，可以点击放大
export default function ZoomImage(props) {
  const theme = useTheme();

  const { alt, src, style } = props;

  let overlayBgColorStart = 'rgba(255, 255, 255, 0)';
  let overlayBgColorEnd = 'rgba(255, 255, 255, 0.9)';

  if (theme.palette.mode === 'dark') {
    overlayBgColorStart = 'rgba(0, 0, 0, 0)';
    overlayBgColorEnd = 'rgba(0, 0, 0, 0.9)';
  }

  return (
    <Stack justifyContent='center' alignItems='center'>
      <Zoom zoomMargin={10}
        overlayBgColorStart={overlayBgColorStart}
        overlayBgColorEnd={overlayBgColorEnd}>
        <img alt={alt || ''} src={src} style={style} />
      </Zoom>
    </Stack>
  )
}
