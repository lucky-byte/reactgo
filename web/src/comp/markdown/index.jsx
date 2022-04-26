import { useEffect, useState, useMemo, createElement } from 'react';
import MarkdownJSX from 'markdown-to-jsx';
import { useTheme } from "@mui/material/styles";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Highlight, { defaultProps } from 'prism-react-renderer';
import vsDark from 'prism-react-renderer/themes/vsDark';
import github from 'prism-react-renderer/themes/github';
import { useSnackbar } from 'notistack';
import OutlinedPaper from '~/comp/outlined-paper';

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
    overrides: {
      p: {
        component: Typography,
        props: {
          variant: 'body1', paragraph: true, textAlign: 'justify',
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
          style: { fontSize: '0.95rem', marginBottom: '6px', textAlign: 'justify' },
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
          variant: 'outlined', sx: {
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
    },
    createElement: createCustomElement,
  }), [codeBgColor, codeColor]);

  return (
    <MarkdownJSX children={content || ''} options={options} sx={sx || {}} />
  )
}

// 语法高亮代码块
function Pre({ children }) {
  const theme = useTheme();
  const [copyVisible, setCopyVisible] = useState(false);
  const [copyTip, setCopyTip] = useState('复制');

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

  const onCopyClick = () => {
    navigator.clipboard.writeText(code);
    setCopyTip('已复制');
    setTimeout(() => { setCopyTip('复制') }, 500);
  }

  return (
    <Highlight {...defaultProps} theme={codeTheme} code={code} language={lang}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Paper variant='outlined'
          sx={{ px: 1, my: 1, fontSize: '0.9rem', position: 'relative' }}
          onMouseOver={() => setCopyVisible(true)}
          onMouseOut={() => setCopyVisible(false)}>
          <pre style={{ overflowX: 'auto' }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
          {copyVisible &&
            <Tooltip title={copyTip}>
              <IconButton sx={{ position: 'absolute', right: 10, top: 10 }}
                onClick={onCopyClick}>
                <ContentCopyIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          }
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

function Wrapper(props) {
  const { children, sx } = props;

  return <Box as='article' children={children} sx={sx || {}} />
}

function createCustomElement(type, props, children) {
  if (typeof type === 'string') {
    if (type.charAt(0) === type.charAt(0).toUpperCase()) {
      const comp = customElements[type];
      if (comp) {
        return createElement(comp, props, children)
      }
      console.warn('不支持的 Markdown 自定义组件 ', type);
      return null;
    }
  }
  return createElement(type, props, children);
}

// 可以在 Markdown 中使用下列的组件
const customElements = {
  'Stack': Stack,
  'Paper': Paper,
  'Typography': Typography,
  'Link': Link,
  'IconButton': IconButton,
  'Button': Button,
  'Divier': Divider,
}
