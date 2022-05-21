import { lazy } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import useTitle from "~/hook/title";
import { useSetCode } from "~/state/code";
import md from './welcome.md';

// 代码拆分
const Markdown = lazy(() => import('~/comp/markdown'));

export default function Welcome() {
  useTitle('欢迎');
  useSetCode(100);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Markdown url={md} />
      </Paper>
    </Container>
  )
}
