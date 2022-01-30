import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import InplaceInput from '~/comp/inplace-input';
import titleState from "~/state/title";
import progressState from "~/state/progress";
import { get, post, del, put } from '~/rest';

export default function AclList() {
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState('');
  const [acls, setAcls] = useState([]);
  const [info, setInfo] = useState({});

  useEffect(() => { setTitle('访问控制'); }, [setTitle]);

  const loadInfo = useCallback(async uuid => {
    try {
      setProgress(true);

      const resp = await post('/system/acl/info', new URLSearchParams({ uuid }));
      setInfo(resp || {});
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setProgress(false);
    }
  }, [enqueueSnackbar, setProgress]);

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/system/acl/');
        if (resp.acls && resp.acls.length > 0) {
          let uuid = resp.acls[0].uuid;

          const last_uuid = localStorage.getItem('last-acl-uuid');
          if (last_uuid) {
            uuid = last_uuid;
          }
          setTabValue(uuid);
          await loadInfo(uuid);
        }
        setAcls(resp.acls || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, loadInfo, setProgress]);

  const onAddClick = () => {
    navigate('add');
  }

  const onTabChange = async (e, uuid) => {
    setTabValue(uuid);
    await loadInfo(uuid);
    localStorage.setItem('last-acl-uuid', uuid);
  };

  const { innerHeight: height } = window;
  const maxHeight = height - 150;

  return (
    <Container as='main' maxWidth='md' sx={{ py: 4 }}>
      <Stack direction='row'>
        <Paper elevation={0} sx={{ height: maxHeight, width: 180, mr: 2 }}>
          <Stack>
            <Stack direction='row' alignItems='center' sx={{ pl: 2, py: '3px' }}>
              <Typography variant='h6' sx={{ flex: 1, mr: 2 }}>
                角色
              </Typography>
              <IconButton onClick={onAddClick}>
                <AddIcon color='primary' />
              </IconButton>
            </Stack>
            <Typography variant='body2' sx={{ ml: 2 }}>共 {acls.length} 项</Typography>
            <Divider sx={{ my: 1 }} />
            <Tabs orientation="vertical" value={tabValue} onChange={onTabChange}
              variant="scrollable" scrollButtons={false} sx={{
                maxHeight: maxHeight - 80
              }}>
              {acls.map((a, i) => (
                <Tab key={a.uuid} value={a.uuid} sx={{ alignItems: 'flex-start' }}
                  label={
                    <Stack direction='row'>
                      <Typography variant='button' color='#8888'
                        sx={{ width: 24, textAlign: 'left' }}>
                        {i + 1}
                      </Typography>
                      <Typography variant='button'>{a.name}</Typography>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Stack>
        </Paper>
        <AclInfo info={info} setInfo={setInfo} acls={acls} setAcls={setAcls} />
      </Stack>
    </Container>
  )
}

function AclInfo(props) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const [collapsed, setCollapsed] = useState(false);

  const { info, setInfo, acls, setAcls } = props;

  const onChangeName = async value => {
    try {
      await put('/system/acl/name', new URLSearchParams({
        uuid: info.uuid, name: value,
      }));
      setInfo({ ...info, name: value, update_at: dayjs(), });

      const newAcls = acls.map(a => {
        if (a.uuid === info.uuid) {
          return {...a, name: value }
        }
        return a
      });
      setAcls(newAcls);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onChangeSummary = async value => {
    try {
      await put('/system/acl/summary', new URLSearchParams({
        uuid: info.uuid, summary: value,
      }));
      setInfo({ ...info, summary: value, update_at: dayjs(), });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onDelete = async () => {
    try {
      await confirm({
        description: '确定要删除该角色吗？删除后不能恢复。',
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });
      const params = new URLSearchParams({ uuid: info.uuid });
      await del('/system/acl/delete?' + params.toString());
      localStorage.removeItem('last-acl-uuid');
      enqueueSnackbar(`${info.name} 已被删除`, { variant: 'success' });
      window.location.reload();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  const onModifyAllows = () => {
    navigate('allows', { state: {
      acl: info.uuid, name: info.name, summary: info.summary,
    }});
  }

  const { innerHeight: height } = window;
  const maxHeight = height - 150;

  return (
    <Paper variant='outlined' sx={{ flex: 1, maxHeight: maxHeight, overflow: 'scroll' }}>
      <Toolbar>
        <InplaceInput variant='h6' sx={{ flex: 1 }} text={info.name || ''}
          fontSize='large' onConfirm={onChangeName}
        />
        <IconButton onClick={() => { setCollapsed(!collapsed) }}>
          {collapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Button color='error' onClick={onDelete}>删除</Button>
      </Toolbar>
      <Stack sx={{ ml: 3 }} spacing={1}>
        <InplaceInput variant='body2' text={info.summary || ''} multiline
          fontSize='small' onConfirm={onChangeSummary}
        />
        <Collapse in={collapsed}>
          <Stack sx={{ mb: 2 }}>
            <Typography variant='body2' color='gray'>
              创建时间: {dayjs(info.create_at).format('YYYY/MM/DD HH:mm:ss')}
            </Typography>
            <Typography variant='body2' color='gray'>
              更新时间: {dayjs(info.update_at).format('YYYY/MM/DD HH:mm:ss')}
            </Typography>
          </Stack>
        </Collapse>
      </Stack>
      <Divider />
      <Stack sx={{ mx: 3, my: 2 }}>
        <Stack direction='row' alignItems='center' sx={{ mb: 1 }}>
          <Typography variant='subtitle2' sx={{ flex: 1 }}>
            允许访问 ({info?.allows?.length || 0} 项)
          </Typography>
          <Button onClick={onModifyAllows}>修改</Button>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align='center' padding='checkbox'>#</TableCell>
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
              {(info?.allows || []).map((row, index) => (
                <TableRow key={row.code} hover
                  sx={{ '> td, > th': { border: 0 } }}>
                  <TableCell align="center" padding='checkbox'>
                    {index + 1}
                  </TableCell>
                  <TableCell align="center">{row.code}</TableCell>
                  <TableCell align="center">{row.title}</TableCell>
                  <TableCell align="center" padding='checkbox'>
                    {row.read ?
                      <CheckIcon color='success' /> :
                      <BlockIcon color='warning' fontSize='small' />
                    }
                  </TableCell>
                  <TableCell align="center" padding='checkbox'>
                    {row.write ?
                      <CheckIcon color='success' /> :
                      <BlockIcon color='warning' fontSize='small' />
                    }
                  </TableCell>
                  <TableCell align="center" padding='checkbox'>
                    {row.admin ?
                      <CheckIcon color='success' /> :
                      <BlockIcon color='warning' fontSize='small' />
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  )
}
