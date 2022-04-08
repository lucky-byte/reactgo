import { Component, useState, useRef } from 'react';
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { useReactToPrint } from 'react-to-print';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorStack: [],
      componentStack: [],
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    const es = error?.stack.split('at ');
    const cs = errorInfo.componentStack.split('at ');
    this.setState({ errorStack: es, componentStack: cs });
  }

  render() {
    if (this.state.hasError) {
      return <Content {...this.state} />
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

function Content(props) {
  const [expanded, setExpanded] = useState(false);

  const { error, errorStack, componentStack } = props;

  const contentRef = useRef();

  const printContent = useReactToPrint({
    content: () => contentRef.current,
  });

  const onPrint = () => {
    if (expanded) {
      printContent();
    } else {
      setExpanded(true);
      setTimeout(printContent, 1000);
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ my: 2 }} ref={contentRef}>
      <Stack alignItems='flex-start'>
        <Typography variant='h4' color='error'>{error?.message}</Typography>
        <Typography as='code' variant='body2'>{window.location.href}</Typography>
        <Stack direction='row'>
          <Button size='small' onClick={() => { setExpanded(!expanded) }}>
            详细信息
          </Button>
          <Button size='small' onClick={onPrint}>打印</Button>
        </Stack>
        <Collapse in={expanded}>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Stack>
              <Typography variant='subtitle2'>Error Stack:</Typography>
              {errorStack?.map(i => (
                i.trim() ?
                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                    at {i}
                  </Typography> : null
              ))}
            </Stack>
            <Stack sx={{ mt: 2 }}>
              <Typography variant='subtitle2'>Component Stack:</Typography>
              {componentStack?.map(i => (
                i.trim() ?
                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                    at {i}
                  </Typography> : null
              ))}
            </Stack>
          </Paper>
        </Collapse>
      </Stack>
    </Container>
  )
}
