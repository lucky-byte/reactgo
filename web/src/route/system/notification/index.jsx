import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import titleState from "~/state/title";

export default function Notification() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('系统事件'); }, [setTitle]);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
      </Paper>
    </Container>
  )
}
