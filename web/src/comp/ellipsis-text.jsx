import Typography from '@mui/material/Typography';

export default function EllipsisText(props) {
  const { children, sx, lines, ...others } = props;

  return (
    <Typography {...others} sx={{
      textAlign: 'justify',
      ...sx || {},
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: lines || 1,
      WebkitBoxOrient: 'vertical',
    }}>
      {children}
    </Typography>
  )
}
