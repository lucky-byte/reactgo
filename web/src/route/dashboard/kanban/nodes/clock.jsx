import { useEffect, useState, useRef } from 'react';
import { useTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import ReactClock from 'react-clock';
import './clock.css';

export default function Clock() {
  const theme = useTheme();
  const [value, setValue] = useState(new Date());
  const [size, setSize] = useState(100);

  const clockClass = theme.palette.mode === 'dark' ? 'clock-dark' : '';

  const ref = useRef()

  useEffect(() => {
    const t = setInterval(() => setValue(new Date()), 1000);
    return () => clearInterval(t)
  }, []);

  useEffect(() => {
    const min = Math.min(ref.current.offsetHeight, ref.current.offsetWidth);
    const t = setTimeout(() => { setSize(min - 20) }, 500);
    return () => clearTimeout(t);
  });

  return (
    <Box ref={ref} display='flex' alignItems='center' justifyContent='center'
      height='100%'>
      <ReactClock value={value} size={size} className={clockClass} />
    </Box>
  )
}
