import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import titleState from "~/state/title";
import Tree from './tree';

export default function Home() {
  const setTitle = useSetRecoilState(titleState);
  const [value, setValue] = useState(0);

  useEffect(() => { setTitle('层级管理'); }, [setTitle]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Stack as='main' role='main' direction='row' alignItems='flex-start'
      spacing={2} sx={{ p: 2, mb: 4 }}>
      <Tree />
      <Paper variant='outlined' sx={{ flex: 1, px: 4, py: 3, mb: 4 }}>
      <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="信息" />
          <Tab label="绑定" />
          <Tab label="Item Three" />
        </Tabs>
      </Paper>
    </Stack>
  )
}
