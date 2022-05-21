import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

export default function NumberTip(props) {
  return (
    <Tooltip title={props.tip}>
      <Typography component='span' color='primary'
        sx={{ cursor: 'pointer', fontSize: 'inherit' }}>
        {'{'}{props.n}{'}'}
      </Typography>
    </Tooltip>
  )
}
