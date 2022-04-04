import { lazy, useEffect, useState } from 'react';
import { useTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import "easymde/dist/easymde.min.css";

// 代码拆分
const SimpleMDE = lazy(() => import('react-simplemde-editor'));

// Markdown 编辑器
export default function MDEditor(props) {
  const theme = useTheme();
  const [options, setOptions] = useState({});

  // 异步加载 marked 模块，代码拆分
  useEffect(() => {
    (async () => {
      const { parse } = await import('marked');
      setOptions({
        spellChecker: false,
        // lineNumbers: true,
        uploadImage: true,
        previewRender: text => {
          return parse(text);
        },
      });
    })();
  }, []);

  const MDE = theme.palette.mode === 'light' ? SimpleMDE : SimpleMDEDark;

  return (
    <MDE {...props} options={options} />
  )
}

function SimpleMDEDark(props) {
  const theme = useTheme();

  return (
    <Box component={SimpleMDE} {...props}
      sx={{
        "& .CodeMirror": {
          color: theme.palette.common.white,
          borderColor: theme.palette.grey[700],
          backgroundColor: "inherit",
        },
        "& .cm-s-easymde .CodeMirror-cursor": {
          borderColor: theme.palette.grey[500],
        },
        "& .editor-toolbar > *": {
          color: theme.palette.common.white,
        },
        "& .editor-toolbar, .cm-s-easymde": {
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.grey[700],
        },
        "& .editor-toolbar > .active, .editor-toolbar > button:hover": {
          backgroundColor: theme.palette.background.paper
        },
        "& .editor-preview pre, .cm-comment": {
          backgroundColor: theme.palette.background.paper
        },
        "& .editor-preview": {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.common.white,
        },
      }}
    />
  )
}
