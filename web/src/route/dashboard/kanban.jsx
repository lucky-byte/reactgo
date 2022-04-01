import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import titleState from "~/state/title";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Typography } from '@mui/material';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Kanban() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('看板'); }, [setTitle]);

  const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 }
  ];

  return (
    <Container as='main' role='main' maxWidth='lg' sx={{ mb: 4 }}>
      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      >
        <Paper variant='outlined' key='a'>
          <Typography>A</Typography>
        </Paper>
        <Paper variant='outlined' key='b'>
          <Typography>B</Typography>
        </Paper>
        <Paper variant='outlined' key='c'>
          <Typography>C</Typography>
        </Paper>
      </ResponsiveGridLayout>
    </Container>
  )
}
