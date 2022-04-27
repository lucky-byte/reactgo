import Box from '@mui/material/Box';

// 图片自动缩放到全宽
export default function Image(props) {
  return (
    <Box component='span' sx={{ maxWidth: '100%', flex: 1 }}>
      <img alt='图片' src={props.src} style={{
        objectFit: 'contain', width: '100%', flex: 1,
      }} />
    </Box>
  )
}
