import { useTheme } from '@mui/material/styles';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// 图片，可以点击放大
export default function Image(props) {
  const theme = useTheme();

  let overlayBgColorStart = 'rgba(255, 255, 255, 0)';
  let overlayBgColorEnd = 'rgba(255, 255, 255, 0.9)';

  if (theme.palette.mode === 'dark') {
    overlayBgColorStart = 'rgba(0, 0, 0, 0)';
    overlayBgColorEnd = 'rgba(0, 0, 0, 0.9)';
  }

  return (
    <Zoom wrapElement='span' closeText='缩小' openText='放大'
      overlayBgColorStart={overlayBgColorStart}
      overlayBgColorEnd={overlayBgColorEnd}>
      <img alt={props.alt || '图片'} src={props.src} style={{
        objectFit: 'contain', maxWidth: '100%',
      }} />
    </Zoom>
  )
}
