import { useState } from 'react';
import { useTheme } from "@mui/material/styles";
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Highlight, { defaultProps } from 'prism-react-renderer';
import vsDark from 'prism-react-renderer/themes/vsDark';
import github from 'prism-react-renderer/themes/github';

// 语法高亮代码块
export default function Pre({ children }) {
  const theme = useTheme();
  const [copyVisible, setCopyVisible] = useState(false);
  const [copyTip, setCopyTip] = useState('复制');

  if (children?.type !== 'code') {
    return (
      <Box component='pre' sx={{ whiteSpace: 'pre-wrap', minWidth: 0 }}>
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
          sx={{
            px: 1, my: 1, fontSize: '0.9rem', position: 'relative',
          }}
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
