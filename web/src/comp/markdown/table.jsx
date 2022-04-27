import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import OutlinedPaper from '~/comp/outlined-paper';


// 表格容器
export default function TableWrapper(props) {
  const { children, ...otherProps } = props;

  return (
    <TableContainer component={OutlinedPaper} sx={{ my: 2 }}>
      <Table {...otherProps} sx={{ '& tr:last-child td': { borderBottom: 0 } }}>
        {children}
      </Table>
    </TableContainer>
  );
}
