import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import titleState from "~/state/title";
import Tree from './tree';

export default function Home() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('层级管理'); }, [setTitle]);

  return (
    <Stack as='main' role='main' direction='row' spacing={2} sx={{ p: 2, mb: 4 }}>
      <Tree />
      <Paper elevation={3} sx={{ flex: 1, px: 4, py: 3, mb: 4 }}>
      </Paper>
    </Stack>
  )
}
