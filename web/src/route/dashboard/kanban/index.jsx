import { lazy, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import activedNodesState from './state';
import nodes from './nodes';
import Config from './config';

const Layout = lazy(() => import("./layout"));

export default function Kanban() {
  const [activedNodes, setActivedNodes] = useRecoilState(activedNodesState);
  const [width, setWidth] = useState(1200);

  useTitle('看板');
  useSetCode(101);

  const ref = useRef()

  // 每次渲染时获取容器的宽度，用于传递给 Layout 布局
  useEffect(() => {
    const t = setTimeout(() => { setWidth(ref.current.offsetWidth - 48) }, 500);
    return () => clearTimeout(t);
  });

  // 从 localStorage 中读取上次激活的面板
  useEffect(() => {
    const storage = localStorage.getItem('kanban-nodes');
    if (storage) {
      try {
        const keys = JSON.parse(storage);

        if (!Array.isArray(keys)) {
          return localStorage.removeItem('kanban-nodes');
        }
        const actived = [];

        for (const key of keys) {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].key === key) {
              actived.push(nodes[i]);
              break;
            }
          }
        }
        setActivedNodes(actived);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('读布局数据错：', err?.message);
        }
        localStorage.removeItem('kanban-panels');
      }
    }
  }, [setActivedNodes]);

  return (
    <Container as='main' role='main' maxWidth={false} sx={{ mb: 4 }} ref={ref}>
      <Layout width={width}>
        {activedNodes.map(item => (
          <Paper key={item.key} variant='outlined' data-grid={{
            x: 0, y: 0, w: item.w || 1, h: item.h || 1,
            maxW: item.maxW || 16,
            isResizable: item.resizable,
          }}>
            <Typography>{item.title}</Typography>
          </Paper>
        ))}
      </Layout>
      <Config />
    </Container>
  )
}
