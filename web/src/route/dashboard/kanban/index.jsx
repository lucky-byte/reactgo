import { lazy } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import useTitle from "~/hook/title";

const Layout = lazy(() => import("./layout"));

export default function Kanban() {
  useTitle('看板');

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
