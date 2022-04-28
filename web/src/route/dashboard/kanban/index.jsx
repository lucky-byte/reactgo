import { lazy, useEffect, useRef, useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import Config from './config';

const Layout = lazy(() => import("./layout"));

export default function Kanban() {
  const [width, setWidth] = useState(1200);

  useTitle('看板');
  useSetCode(101);

  const ref = useRef()

  // 每次渲染时获取容器的宽度，用于传递给 Layout 布局
  useEffect(() => {
    const t = setTimeout(() => { setWidth(ref.current.offsetWidth - 48) }, 500);
    return () => clearTimeout(t);
  });

  return (
    <Container as='main' role='main' maxWidth={false} sx={{ mb: 4 }} ref={ref}>
      <Layout width={width}>
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
      <Config />
    </Container>
  )
}
