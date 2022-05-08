import { lazy } from 'react';
import { useTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import "codemirror/theme/abcdef.css";

const SimpleMDE = lazy(() => import('react-simplemde-editor'));

// Dark 模式
export default function SimpleMDEDark(props) {
  const theme = useTheme();

  return (
    <Box component={SimpleMDE} {...props}
      sx={{
        "& .CodeMirror, .editor-preview, .editor-toolbar": {
          color: theme.palette.common.white,
          borderColor: theme.palette.grey[700],
          backgroundColor: theme.palette.background.default,
        },
        "& .editor-toolbar > *": {
          color: theme.palette.common.white,
        },
        "& .editor-toolbar > .active, .editor-toolbar > button:hover": {
          backgroundColor: theme.palette.background.paper
        },
        "& .editor-preview pre, .cm-comment": {
          backgroundColor: theme.palette.background.paper
        },
        "& .editor-preview a": {
          color: theme.palette.info.light,
        },
      }}
    />
  )
}
