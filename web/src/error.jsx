import { Component } from 'react';
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      expanded: false,
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
      return (
        <Container as='main' maxWidth='md' sx={{ my: 2 }}>
          <Stack alignItems='flex-start'>
            <Typography variant='h4' color='error'>
              {this.state.error?.message}
            </Typography>
            <Typography as='code' variant='body2'>{window.location.href}</Typography>
            <Button size='small' onClick={() => {
              this.setState({ expanded: !this.state.expanded });
            }}>
              详细信息
            </Button>
            <Collapse in={this.state.expanded}>
              <Paper variant='outlined' sx={{ p: 2 }}>
                <Stack>
                  <Typography variant='subtitle2'>Error Stack:</Typography>
                  {this.state.errorStack?.map(i => (
                    i.trim() ?
                      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                        at {i}
                      </Typography> : null
                  ))}
                </Stack>
                <Stack sx={{ mt: 2 }}>
                  <Typography variant='subtitle2'>Component Stack:</Typography>
                  {this.state.componentStack?.map(i => (
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
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
