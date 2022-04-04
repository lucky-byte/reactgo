import { lazy, useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import titleState from "~/state/title";
import md from './welcome.md';

// 代码拆分
const Markdown = lazy(() => import('~/comp/markdown'));

export default function Welcome() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('欢迎'); }, [setTitle]);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Markdown url={md} />
      </Paper>
    </Container>
  )
}
