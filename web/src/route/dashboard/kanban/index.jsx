import { lazy, useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import titleState from "~/state/title";
import { Typography } from '@mui/material';

const Layout = lazy(() => import("./layout"));

export default function Kanban() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('看板'); }, [setTitle]);

  return (
    <Container as='main' role='main' maxWidth='lg' sx={{ mb: 4 }}>
      <Layout>
        <Paper variant='outlined' key='a'>
          <Typography>A</Typography>
        </Paper>
        <Paper variant='outlined' key='b'>
          <Typography>B</Typography>
        </Paper>
        <Paper variant='outlined' key='c'>
          <Typography>C</Typography>
        </Paper>
      </Layout>
    </Container>
  )
}
