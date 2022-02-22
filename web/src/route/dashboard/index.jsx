import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import titleState from "~/state/title";
import Markdown from '~/comp/markdown';
import md from './index.md';

export default function Dashboard() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('看板'); }, [setTitle]);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Markdown url={md} />
      </Paper>
    </Container>
  )
}
