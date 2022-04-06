import { useEffect, useState, useMemo } from 'react';
import MarkdownJSX from 'markdown-to-jsx';
import { useTheme } from "@mui/material/styles";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import Highlight, { defaultProps } from 'prism-react-renderer';
import vsDark from 'prism-react-renderer/themes/vsDark';
import github from 'prism-react-renderer/themes/github';
import { useSnackbar } from 'notistack';
import OutlinedPaper from '~/comp/outlined-paper';

export default function Markdown(props) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [content, setContent] = useState('');

  const { url, children } = props;

  const codeColor = theme.palette.mode === 'dark' ? 'white' : 'black';
  const codeBgColor = theme.palette.mode === 'dark' ? '#333' : '#eee';

  useEffect(() => {
    if (url) {
      (async () => {
        try {
          const resp = await fetch(url, { method: 'GET' });
          const text = await resp.text();
          setContent(text || '');
        } catch (err) {
          enqueueSnackbar(err.message);
        }
      })();
    } else {
      setContent(children);
    }
  }, [url, children, enqueueSnackbar]);

  const options = useMemo(() => ({
    wrapper: 'article',
    overrides: {
      p: {
        component: Typography,
        props: {
          variant: 'body1', paragraph: true,
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
          style: { fontSize: '0.95rem', marginBottom: '6px', },
        }
      },
      a: {
        component: Link,
        props: {
          underline: 'hover',
        }
      },
      blockquote: {
        component: Paper,
        props: {
          variant: 'outlined', sx: {
            p: 1, borderLeft: `4px solid #088`, my: 1,
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
    },
  }), [codeBgColor, codeColor]);

  return (
    <MarkdownJSX children={content || ''} options={options} />
  )
}

// 语法高亮代码块
function Pre({ children }) {
  const theme = useTheme();

  if (children?.type !== 'code') {
    return (
      <Box component='pre' sx={{ whiteSpace: 'pre-wrap' }}>
        {children}
      </Box>
    )
  }
  const codeTheme = theme.palette.mode === 'dark' ? vsDark : github;

  const className = children.props.className;
  const code = children.props.children;
  const lang = className ? className.replace('lang-', '') : 'tsx';

  return (
    <Highlight {...defaultProps} theme={codeTheme} code={code} language={lang}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Paper variant='outlined' sx={{ px: 1, my: 1, fontSize: '0.9rem' }}>
          <pre style={{ overflowX: 'auto' }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        </Paper>
      )}
    </Highlight>
  )
}

// 表格容器
function TableWrapper(props) {
  const { children, ...otherProps } = props;

  return (
    <TableContainer component={OutlinedPaper} sx={{ my: 2 }}>
      <Table {...otherProps}>{children}</Table>
    </TableContainer>
  );
}
