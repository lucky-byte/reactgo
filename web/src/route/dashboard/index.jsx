import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import titleState from "~/state/title";
import Markdown from '~/comp/markdown';

export default function Dashboard() {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('看板'); }, [setTitle]);

  return (
    <Container as='main' role='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Markdown>
          {`
# 欢迎...

欢迎使用 ReactGo，前后端分离的基础开发平台，ReactGo 前端采用 React 技术开发，
后端采用 Go 语言开发。完整的技术栈请参考文档说明。

ReactGo 提供许多开箱即用的基础功能，用于快速交付业务系统，
这也是 ReactGo 的主要目标。

---

想了解更多？请在 [这里](https://reactgo.headless.pub) 查看开发文档。
          `}
        </Markdown>
      </Paper>
    </Container>
  )
}
