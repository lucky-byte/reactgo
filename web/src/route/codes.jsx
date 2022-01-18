import { useEffect, useState } from 'react';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import titleState from "../state/title";
import codes from './sidebar/codes';
import SearchBar from '../comp/search-bar';

export default function Codes() {
  const setTitle = useSetRecoilState(titleState);
  const [keyword, setKeyword] = useState('');
  const [codeList, setCodeList] = useState(codes);

  useEffect(() => { setTitle('导航代码'); }, [setTitle]);

  useEffect(() => {
    const trimed = keyword.trim();
    if (!trimed) {
      return setCodeList(codes);
    }
    const entries = Object.entries(codes).filter(([code, value]) => {
      if (String(code).includes(trimed)) {
        return true;
      }
      return (value.title.includes(trimed));
    });
    setCodeList(Object.fromEntries(entries));
  }, [keyword]);

  const onKeywordChange = e => {
    setKeyword(e.target.value);
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchBar value={keyword} onChange={onKeywordChange} />
        <Typography textAlign='right' sx={{ flex: 1 }} variant='caption'>
          共 {Object.keys(codeList).length} 条记录
        </Typography>
      </Toolbar>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>代码</TableCell>
              <TableCell>菜单</TableCell>
              <TableCell>路径</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(codeList).map(code => (
              <TableRow key={code} hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{code}</TableCell>
                <TableCell>{codes[code].title}</TableCell>
                <TableCell>{codes[code].to}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
