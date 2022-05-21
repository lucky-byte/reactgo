import { useEffect, useState, useMemo } from 'react';
import MarkdownJSX from 'markdown-to-jsx';
import { useTheme } from "@mui/material/styles";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
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
      blockquote: {
        component: Paper,
        props: {
          variant: 'outlined',
          sx: {
            p: 2, borderLeft: `4px solid #088`, my: 1,
            '& p': {
              marginBottom: 0,
            }
          }
        }
      },
      a: ALink,
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
      table:  TableWrapper,
      thead:  TableHead,
      tbody:  TableBody,
      th:     TableCell,
      tr:     TableRow,
      td:     TableCell,
      tfoot:  TableFooter,
      img:    Image,
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

function ALink(props) {
  const inline = props?.href?.startsWith('#');

  if (inline) {
    return (
      <Link {...props} underline='hover' />
    )
  }
  return (
    <Link {...props} target='_blank' underline='hover' rel='noopener' />
  )
}
