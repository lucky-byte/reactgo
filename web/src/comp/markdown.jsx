import { useTheme } from "@mui/material/styles";
import MuiMarkdown from 'mui-markdown';
import vsDark from 'prism-react-renderer/themes/vsDark';
import vsLight from 'prism-react-renderer/themes/vsLight';

export default function Markdown(props) {
  const theme = useTheme();
  const { children } = props;

  const codeBlockTheme = theme.palette.mode === 'dark' ? vsDark : vsLight;
  const inlineCodeColor = theme.palette.mode === 'dark' ? 'white' : 'black';
  const inlineCodeBgColor = theme.palette.mode === 'dark' ? '#333' : '#ddd';
  const inlineCodeBorderColor = theme.palette.mode === 'dark' ? '#222' : '#ccc';

  return (
    <MuiMarkdown disableTableContainer codeBlockTheme={codeBlockTheme}
      overrides={{
        code: {
          component: 'code',
          props: {
            style: {
              backgroundColor: inlineCodeBgColor,
              borderRadius: '4px',
              color: inlineCodeColor,
              margin: '0.1rem 0.2rem',
              padding: '0rem 0.5rem',
              border: `1px solid ${inlineCodeBorderColor}`,
            }
          },
        },
      }}
    >
      {children}
    </MuiMarkdown>
  )
}