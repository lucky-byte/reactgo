import { useEffect, useState } from 'react';
import { useRecoilValue } from "recoil";
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import PrintIcon from '@mui/icons-material/Print';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import SearchBar from '~/comp/search-bar';
import userState from "~/state/user";
import { useSetCode } from "~/state/code";
import codes from './sidebar/codes';

export default function Codes() {
  const user = useRecoilValue(userState);
  const [keyword, setKeyword] = useState('');
  const [codeList, setCodeList] = useState(codes);
  const [printNode, setPrintNode] = useState(null);

  useTitle('导航代码');
  useSetCode(0);

  const print = usePrint(printNode);

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

  const allow_codes = user?.acl_allows.map(item => {
    return parseInt(item.code);
  });

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Toolbar sx={{ mt: 2 }} disableGutters>
        <SearchBar value={keyword} onChange={onKeywordChange} />
        <Typography textAlign='right' sx={{ flex: 1 }} variant='caption'>
          共 {Object.keys(codeList).length} 条记录
        </Typography>
        <IconButton color='primary' sx={{ ml: 1 }} onClick={print}>
          <PrintIcon />
        </IconButton>
      </Toolbar>
      <TableContainer ref={setPrintNode}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align='center'>代码</TableCell>
              <TableCell align='center'>菜单</TableCell>
              <TableCell align='center'>描述</TableCell>
              <TableCell>路径</TableCell>
              <TableCell padding='checkbox'>授权</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(codeList).map(code => (
              <TableRow key={code} hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align='center'>{code}</TableCell>
                <TableCell align='center'>{codes[code].title}</TableCell>
                <TableCell align='center'>{codes[code].desc || '-'}</TableCell>
                <TableCell>{codes[code].to}</TableCell>
                <TableCell padding='checkbox'>
                  {
                    codes[code].allow ? <CheckIcon color='success' /> : (
                      allow_codes?.includes(parseInt(code)) ?
                        <CheckIcon color='success' />
                        :
                        <BlockIcon color='warning' />
		    )
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
