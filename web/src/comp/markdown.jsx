import MuiMarkdown from 'mui-markdown';

export default function Markdown(props) {
  const { children } = props;

  return (
    <MuiMarkdown disableTableContainer>
      {children}
    </MuiMarkdown>
  )
}
