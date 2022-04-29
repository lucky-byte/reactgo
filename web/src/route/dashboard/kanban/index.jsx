import { lazy, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import kanbanState from './state';
import Config from './config';

const Layout = lazy(() => import("./layout"));

export default function Kanban() {
  const [panels, setPanels] = useRecoilState(kanbanState);
  const [width, setWidth] = useState(1200);

  useTitle('看板');
  useSetCode(101);

  const ref = useRef()

  // 每次渲染时获取容器的宽度，用于传递给 Layout 布局
  useEffect(() => {
    const t = setTimeout(() => { setWidth(ref.current.offsetWidth - 48) }, 500);
    return () => clearTimeout(t);
  });

  // 从缓存中读取上次激活的面板
  useEffect(() => {
    const saved = localStorage.getItem('kanban-panels');
    if (!saved) {
      return;
    }
    try {
      const ps = JSON.parse(saved);
      setPanels(ps);
    } catch (err) {
      localStorage.removeItem('kanban-panels');
    }
  }, [setPanels]);

  return (
    <Container as='main' role='main' maxWidth={false} sx={{ mb: 4 }} ref={ref}>
      <Layout width={width}>
        {panels.map(item => (
          <Paper key={item.key} variant='outlined'>
            <Typography>{item.title}</Typography>
          </Paper>
        ))}
      </Layout>
      <Config />
    </Container>
  )
}
