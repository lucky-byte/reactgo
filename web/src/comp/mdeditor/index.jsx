import { lazy, useEffect, useState } from 'react';
import { useTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import { useSnackbar } from 'notistack';
import "easymde/dist/easymde.min.css";

// 代码拆分
const SimpleMDE = lazy(() => import('react-simplemde-editor'));

// Markdown 编辑器
export default function MDEditor(props) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [options, setOptions] = useState({});

  // 异步加载模块，代码拆分
  useEffect(() => {
    (async () => {
      const marked = await import('marked');
      const hljs = await import('highlight.js');

      //TODO: 切换主题后，2 个 css 都被引入了，这不是期望的效果
      if (theme.palette.mode === 'dark') {
        await import("highlight.js/styles/srcery.css");
      } else {
        await import("highlight.js/styles/xcode.css");
      }

      // 设置 simpleMde 选项
      setOptions({
        spellChecker: false,
        lineNumbers: false,
        uploadImage: true,
        imageMaxSize: 8 * 1024 * 1024,
        imageTexts: {
          sbInit: '拖放图片到编辑器或者从剪切板粘贴上传图片',
          sbOnDragEnter: '拖放图片上传',
          sbOnDrop: '上传图片 #images_names#...',
          sbProgress: '上传 #file_name#: #progress#%',
          sbOnUploaded: '上传 #image_name#',
          sizeUnits: ' B, KB, MB',
        },
        errorMessages: {
          noFileGiven: '必须选择一个文件',
          typeNotAllowed: '不允许此类型的图片',
          fileTooLarge: '图片 #image_name# 太大 (#image_size#).\n' +
            '最大允许 #image_max_size#',
          importError: '上传图片 #image_name# 发生错误',
        },
        errorCallback: message => {
          enqueueSnackbar(message);
        },
        previewRender: text => {
          marked.setOptions({
            // 支持语法高亮
            langPrefix: 'hljs language-',
            highlight: (code, lang) => {
              if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(lang, code).value;
              } else {
                return hljs.highlightAuto(code).value;
              }
            },
          });
          return marked.parse(text);
        },
      });
    })();
  }, [theme.palette.mode, enqueueSnackbar]);

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
        "& .CodeMirror, .editor-preview, .editor-toolbar": {
          color: theme.palette.common.white,
          borderColor: theme.palette.grey[700],
          backgroundColor: theme.palette.background.default,
        },
        "& .cm-s-easymde .CodeMirror-cursor": {
          borderColor: theme.palette.grey[500],
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
      }}
    />
  )
}
