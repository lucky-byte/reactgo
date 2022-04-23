import { forwardRef } from 'react';
import Paper from '@mui/material/Paper';

// 需要这个组件的主要原因是作为 TableContainer 的 component
const OutlinedPaper = forwardRef((props, ref) => (
  <Paper ref={ref} variant="outlined" {...props} />
));

export default OutlinedPaper;
