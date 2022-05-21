import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import OutlinedPaper from "~/comp/outlined-paper";
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import urlCodes from "~/admin/sidebar/codes";
import { post, get, put } from '~/lib/rest';

export default function Allows() {
  const location = useLocation();
  const navigate = useNavigate();
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [refresh, setRefresh] = useState(true);
  const [codeList, setCodeList] = useState([]);
  const [nCodeChecked, setNCodeChecked] = useState(0);
  const [codeAllChecked, setCodeAllChecked] = useState(false);
  const [codeAllInterminate, setCodeAllInterminate] = useState(false);
  const [allowList, setAllowList] = useState([]);
  const [nAllowChecked, setNAllowChecked] = useState(0);
  const [allowAllChecked, setAllowAllChecked] = useState(false);
  const [allowAllInterminate, setAllowAllInterminate] = useState(false);
  const [updated, setUpdated] = useState(false);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('修改访问控制');

  // 查询已经允许的列表
  useEffect(() => {
    (async () => {
      try {
        if (location.state?.acl && refresh) {
          setProgress(true);

          const params = new URLSearchParams({ acl: location.state.acl });
          const resp = await get('/system/acl/allow/list?' + params.toString());
          const allows = resp.allows || [];
          setAllowList(allows);

          // 更新剩余可用的列表
          const list = Object.keys(urlCodes).map(code => {
            // 如果 allow = true, 则该菜单不需要权限控制
            if (urlCodes[code].allow) {
              return null;
            }
            for (let i = 0; i < allows.length; i++) {
              if (parseInt(allows[i].code) === parseInt(code)) {
                return null;
              }
            }
            return {
              code: parseInt(code),
              title: urlCodes[code].title,
              url: urlCodes[code].to,
            };
          });
          setCodeList(list.filter(i => i !== null));
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, location.state?.acl, setProgress, refresh]);

  // 更新可用的选择框
  useEffect(() => {
    const nchecked = codeList.filter(i => i.checked)?.length || 0;
    if (nchecked === 0 || nchecked === codeList.length) {
      setCodeAllInterminate(false);
    } else {
      setCodeAllInterminate(true);
    }
    setCodeAllChecked(nchecked > 0 && nchecked === codeList.length);
    setNCodeChecked(nchecked);
  }, [codeList]);

  // 选择全部可用菜单
  const onCodeCheckAll = e => {
    const list = codeList.map(i => {
      i.checked = e.target.checked;
      return i;
    });
    setCodeList(list);
  }

  // 选择可用菜单
  const onCodeCheck = (e, index) => {
    const list = [...codeList];
    list[index].checked = !list[index].checked;
    setCodeList(list);
  }

  // 更新可用的选择框
  useEffect(() => {
    const nchecked = allowList.filter(i => i.checked)?.length || 0;
    if (nchecked === 0 || nchecked === allowList.length) {
      setAllowAllInterminate(false);
    } else {
      setAllowAllInterminate(true);
    }
    setAllowAllChecked(nchecked > 0 && nchecked === allowList.length);
    setNAllowChecked(nchecked);
  }, [allowList]);

  // 选择全部已用菜单
  const onAllowCheckAll = e => {
    const list = allowList.map(i => {
      i.checked = e.target.checked;
      return i;
    });
    setAllowList(list);
  }

  // 选择已用菜单
  const onAllowCheck = (e, index) => {
    const list = [...allowList];
    list[index].checked = !list[index].checked;
    setAllowList(list);
  }

  // 添加
  const onAddClick = async () => {
    try {
      const entries = codeList.filter(i => {
        return i.checked;
      });
      const _audit = `访问控制角色 ${location.state?.name} 添加 ${entries.length} 项访问权限`;

      await post('/system/acl/allow/add', new URLSearchParams({
        acl: location.state?.acl, entries: JSON.stringify(entries), _audit,
      }));
      enqueueSnackbar('添加成功', { variant: 'success' });
      setRefresh(true);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 移除
  const onRemoveClick = async () => {
    try {
      const entries = allowList.filter(i => {
        return i.checked;
      })
      const _audit = `访问控制角色 ${location.state?.name} 删除 ${entries.length} 项访问权限`;

      await post('/system/acl/allow/remove', new URLSearchParams({
        acl: location.state?.acl, entries: JSON.stringify(entries), _audit,
      }));
      enqueueSnackbar('移除成功', { variant: 'success' });
      setRefresh(true);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 修改访问权限
  const onAllowReadCheck = async row => {
    let { iread, iwrite, iadmin } = row;

    // 当前是允许的，改变成不允许，同时也会取消修改和管理权限
    if (row.iread) {
      [iread, iwrite, iadmin] = [false, false, false];
    } else {
      [iread, iwrite, iadmin] = [true, false, false];
    }
    await onAllowUpdateCheck(row.uuid, row.title, iread, iwrite, iadmin);
  }

  // 修改写权限
  const onAllowWriteCheck = async row => {
    let { iread, iwrite, iadmin } = row;

    // 当前是允许的，改变成不允许，同时也会取消管理权限
    if (row.iwrite) {
      [iwrite, iadmin] = [false, false];
    } else {
      [iread, iwrite] = [true, true];
    }
    await onAllowUpdateCheck(row.uuid, row.title, iread, iwrite, iadmin);
  }

  // 修改管理权限
  const onAllowAdminCheck = async row => {
    let { iread, iwrite, iadmin } = row;

    // 当前是允许的，改变成不允许
    if (row.iadmin) {
      iadmin = false
    } else {
      [iread, iwrite, iadmin] = [true, true, true];
    }
    await onAllowUpdateCheck(row.uuid, row.title, iread, iwrite, iadmin);
  }

  // 修改权限
  const onAllowUpdateCheck = async (uuid, title, iread, iwrite, iadmin) => {
    try {
      setUpdated(true);

      const _audit = `修改访问控制角色 ${location.state?.name} 菜单 ${title} 的访问权限`;

      await put('/system/acl/allow/update', new URLSearchParams({
        uuid, iread, iwrite, iadmin, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setRefresh(true);
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setUpdated(false);
    }
  }

  if (!location.state?.acl) {
    return <Navigate to='..' replace />
  }

  const { innerHeight: height } = window;
  const maxHeight = height - 210;

  return (
    <Container as='main' maxWidth='md' sx={{ py: 4 }}>
      <Stack direction='row' alignItems='center' sx={{ mb: 3 }}>
        <IconButton aria-label='返回' onClick={() => { navigate('..') }}>
          <ArrowBackIcon color='primary' />
        </IconButton>
        <Stack sx={{ flex: 1, ml: 1 }}>
          <Typography variant='h6'>{location.state?.name}</Typography>
          <Typography variant='body2'>{location.state?.summary}</Typography>
        </Stack>
      </Stack>
      <Stack direction='row' alignItems='center' spacing={2}>
        <TableContainer component={OutlinedPaper} sx={{
          flex: 3, height: maxHeight, overflow: 'auto'
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell as='td' align='center' padding='checkbox'>
                  <Checkbox checked={codeAllChecked} onChange={onCodeCheckAll}
                    indeterminate={codeAllInterminate}
                    inputProps={{ "aria-label": "选择全部" }}
                  />
                </TableCell>
                <TableCell align='center'>代码</TableCell>
                <TableCell align='center'>功能</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {codeList.map((row, index) => (
                <TableRow key={row.code} hover selected={row.checked === true}
                  sx={{ '> td, > th': { border: 0 } }}>
                  <TableCell align='center' padding='checkbox'>
                    <Checkbox checked={row.checked === true}
                      onChange={e => onCodeCheck(e, index)}
                      inputProps={{ "aria-label": "选择" }}
                    />
                  </TableCell>
                  <TableCell align="center">{row.code}</TableCell>
                  <TableCell align="center">{row.title}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack spacing={2}>
          <Button endIcon={<ArrowForwardIcon />}
            disabled={nCodeChecked === 0} onClick={onAddClick}>
            添加 {nCodeChecked} 项
          </Button>
          <Button color='warning' startIcon={<ArrowBackIcon />}
            disabled={nAllowChecked === 0} onClick={onRemoveClick}>
            移除 {nAllowChecked} 项
          </Button>
        </Stack>
        <TableContainer component={OutlinedPaper} sx={{
          flex: 5, height: maxHeight, overflow: 'auto'
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell as='td' align='center' padding='checkbox'>
                  <Checkbox checked={allowAllChecked} onChange={onAllowCheckAll}
                    indeterminate={allowAllInterminate}
                    inputProps={{ "aria-label": "选择全部" }}
                  />
                </TableCell>
                <TableCell align='center'>代码</TableCell>
                <TableCell align='center'>功能</TableCell>
                <TableCell align='center' sx={{ whiteSpace: 'nowrap' }}>
                  访问
                </TableCell>
                <TableCell align='center' sx={{ whiteSpace: 'nowrap' }}>
                  修改
                </TableCell>
                <TableCell align='center' sx={{ whiteSpace: 'nowrap' }}>
                  管理
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allowList.map((row, index) => (
                <TableRow key={row.code} hover selected={row.checked === true}
                  sx={{ '> td, > th': { border: 0 } }}>
                  <TableCell align='center' padding='checkbox'>
                    <Checkbox checked={row.checked === true}
                      onChange={e => onAllowCheck(e, index)}
                      inputProps={{ "aria-label": "选择" }}
                    />
                  </TableCell>
                  <TableCell align="center">{row.code}</TableCell>
                  <TableCell align="center">{row.title}</TableCell>
                  <TableCell align="center" padding='checkbox'>
                    <Checkbox disabled={updated} checked={row.iread} color='success'
                      onChange={e => { onAllowReadCheck(row); }}
                      inputProps={{ "aria-label": "访问权限" }}
                    />
                  </TableCell>
                  <TableCell align="center" padding='checkbox'>
                    <Checkbox disabled={updated} checked={row.iwrite} color='success'
                      onChange={e => { onAllowWriteCheck(row); }}
                      inputProps={{ "aria-label": "修改权限" }}
                    />
                  </TableCell>
                  <TableCell align="center" padding='checkbox'>
                    <Checkbox disabled={updated} checked={row.iadmin} color='success'
                      onChange={e => { onAllowAdminCheck(row); }}
                      inputProps={{ "aria-label": "管理权限" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  )
}
