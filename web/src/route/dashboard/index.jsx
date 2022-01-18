import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import titleState from "../../state/title";

export default function Dashboard() {
  const theme = useTheme();
  const setTitle = useSetRecoilState(titleState);

  const amountColor = theme.palette.mode === 'dark' ? 'orange' : 'green';

  useEffect(() => { setTitle('今日交易看板'); }, [setTitle]);

  return (
    <Container as='main'>
      <Stack direction='column' sx={{ my: 4 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant='h5' gutterBottom>今日交易</Typography>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Typography variant='subtitle2'>交易总额:</Typography>
            <Typography variant='h6' fontFamily='Times' letterSpacing={1.1}
              color={amountColor}>
              ¥ 1,009,842,133.00
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Typography variant='subtitle2'>交易笔数:</Typography>
            <Typography variant='h6' fontFamily='Times' letterSpacing={1.1}
              color={amountColor}>
              10323311
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
