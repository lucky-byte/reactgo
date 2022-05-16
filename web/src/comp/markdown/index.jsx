import { useEffect, useState, useMemo } from 'react';
import MarkdownJSX from 'markdown-to-jsx';
import { useTheme } from "@mui/material/styles";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useSnackbar } from 'notistack';
import TableWrapper from './table';
import Pre from './pre';
import Image from './image';
import createCustomElement from './element';

export default function Markdown(props) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [content, setContent] = useState('');

  const { url, children, sx } = props;

  const codeColor = theme.palette.mode === 'dark' ? 'white' : 'black';
  const codeBgColor = theme.palette.mode === 'dark' ? '#333' : '#eee';

  useEffect(() => {
    if (url) {
      (async () => {
        try {
          const resp = await fetch(url, { method: 'GET' });
          const text = await resp.text();
          setContent((text || '').replace(/ {8,}/g, ' '));
        } catch (err) {
          enqueueSnackbar(err.message);
          setContent(`加载 ${url} 失败...`);
        }
      })();
    } else {
      setContent((children || '').replace(/ {8,}/g, ' '));
    }
  }, [url, children, enqueueSnackbar]);

  const options = useMemo(() => ({
    wrapper: Wrapper,
    forceWrapper: true,
    // disableParsingRawHTML: true,
    overrides: {
      p: {
        component: Typography,
        props: {
          variant: 'body1', paragraph: true, lineHeight: 1.8, align: 'justify',
          sx: {
            wordBreak: 'break-word',
          }
        }
      },
      hr: {
        component: Divider,
        props: {
          sx: { my: 1 }
        }
      },
      li: {
        component: 'li',
        props: {
          style: {
            fontSize: '0.95rem', marginBottom: '6px',
          },
        }
      },
      a: {
        component: Link,
        props: {
          underline: 'hover', target: '_blank', rel: 'noopener',
        }
      },
      blockquote: {
        component: Paper,
        props: {
          variant: 'outlined',
          sx: {
            p: 1, borderLeft: `4px solid #088`, my: 1,
            '& p': {
              marginBottom: 0,
            }
          }
        }
      },
      pre: Pre,
      code: {
        component: 'code',
        props: {
          style: {
            backgroundColor: codeBgColor,
            borderRadius: '4px',
            color: codeColor,
            margin: '0 0.2rem',
            padding: '0 0.4rem',
          },
        },
      },
      table: {
        component: TableWrapper,
      },
      tbody: {
        component: TableBody,
      },
      th: {
        component: TableCell,
      },
      td: {
        component: TableCell,
      },
      tfoot: {
        component: TableFooter,
      },
      thead: {
        component: TableHead,
      },
      img: {
        component: Image,
      },
      form: {
        component: Box,
      },
      script: {
        component: Script,
      },
    },
    createElement: createCustomElement,
  }), [codeBgColor, codeColor]);

  return (
    <MarkdownJSX options={options} sx={sx || {}}>
      {content || ''}
    </MarkdownJSX>
  )
}

function Wrapper(props) {
  const { children, sx } = props;

  return (
    <Box as='article' children={children}
      sx={{ ...(sx || {}), wordBreak: 'break-word' }}
    />
  )
}

// <script> 标签内容以错误形式显示出来
function Script(props) {
  return (
    <Alert severity="error" variant='filled'>
      <AlertTitle>脚本(script):</AlertTitle>
      <Typography as='pre'><code>{props.children}</code></Typography>
    </Alert>
  )
}
