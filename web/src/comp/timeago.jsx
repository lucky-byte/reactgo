import { useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

export default function TimeAgo(props) {
  const [ago, setAgo] = useState('');

  const { time, sx, ...others } = props;

  useEffect(() => {
    const timer = setInterval(() => { setAgo(dayjs(time).fromNow()) }, 1000);
    return () => clearInterval(timer)
  }, [time]);

  return (
    <Tooltip title={dayjs(time).format('LL LTS')} arrow>
      <Typography variant='caption' sx={{ ...sx }} {...others}>
        {ago || dayjs(time).fromNow()}
      </Typography>
    </Tooltip>
  )
}
