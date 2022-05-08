import { useEffect, useState, useRef } from 'react';
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
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import PrintIcon from '@mui/icons-material/Print';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import InplaceInput from '~/comp/inplace-input';
import progressState from "~/state/progress";
import useTitle from "~/hook/title";
import usePrint from "~/hook/print";
import { useSetCode } from "~/state/code";
import { get, del, put } from '~/lib/rest';

export default function Home() {
  const navigate = useNavigate();
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState('');
  const [reloadAll, setReloadAll] = useState(true);
  const [acls, setAcls] = useState([]);
  const [info, setInfo] = useState({});

  useTitle('访问控制');
  useSetCode(9010);

  useEffect(() => {
    (async () => {
      try {
        if (tabValue) {
          setProgress(true);

          const query = new URLSearchParams({ uuid: tabValue });
          const resp = await get('/system/acl/info?' + query.toString());
          setInfo(resp || {});
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress, tabValue]);

  useEffect(() => {
    (async () => {
      try {
        if (reloadAll) {
          setProgress(true);

          const resp = await get('/system/acl/');
          if (resp.acls && resp.acls.length > 0) {
            let uuid = resp.acls[0].uuid;

            const last_uuid = localStorage.getItem('last-acl-uuid');
            if (last_uuid) {
              uuid = last_uuid;
            }
            setTabValue(uuid);
          }
          setAcls(resp.acls || []);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
        setReloadAll(false);
      }
    })();
  }, [enqueueSnackbar, setProgress, reloadAll]);

  const onAddClick = () => {
    navigate('add');
  }

  const onTabChange = async (e, uuid) => {
    setTabValue(uuid);
    localStorage.setItem('last-acl-uuid', uuid);
  };

  return (
    <Container as='main' maxWidth='md' sx={{ py: 4 }}>
      <Stack direction='row' spacing={2}>
        <Paper elevation={0} sx={{ width: 180 }}>
          <Stack>
            <Stack direction='row' alignItems='center' sx={{ pl: 2, py: '3px' }}>
              <Stack direction='row' alignItems='baseline' sx={{ flex: 1 }}>
                <Typography variant='h6' sx={{ mr: 1 }}>角色</Typography>
                <Typography variant='body2'>{acls.length} 项</Typography>
              </Stack>
              <IconButton aria-label='添加' onClick={onAddClick}>
                <AddIcon color='primary' />
              </IconButton>
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <Tabs orientation="vertical" value={tabValue} onChange={onTabChange}>
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
        <AclInfo info={info} setInfo={setInfo} acls={acls} setAcls={setAcls}
          setReload={setReloadAll}
        />
      </Stack>
    </Container>
  )
}

function AclInfo(props) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();

  const contentRef = useRef();
  const print = usePrint(contentRef.current);

  const { info, setInfo, acls, setAcls, setReloadAll } = props;

  const onChangeName = async value => {
    try {
      const _audit = `修改访问控制角色名 ${info.name} => ${value}`;

      await put('/system/acl/name', new URLSearchParams({
        uuid: info.uuid, name: value, _audit,
      }));
      setInfo({ ...info, name: value });

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
      const _audit = `修改访问控制角色 ${info.name} 的描述`;

      await put('/system/acl/summary', new URLSearchParams({
        uuid: info.uuid, summary: value, _audit,
      }));
      setInfo({ ...info, summary: value });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onDelete = async () => {
    try {
      await confirm({
        description: '确定要删除该角色吗？删除后不能恢复，如果已经有用户在使用此角色，则删除失败。',
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });
      const _audit = `删除访问控制角色 ${info.name}`;

      const params = new URLSearchParams({ uuid: info.uuid, _audit });
      await del('/system/acl/delete?' + params.toString());

      localStorage.removeItem('last-acl-uuid');
      enqueueSnackbar(`${info.name} 已被删除`, { variant: 'success' });
      setReloadAll(true);
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

  return (
    <Paper variant='outlined' sx={{ flex: 1 }} ref={contentRef}>
      <Stack sx={{ mx: 3, my: 1 }}>
        <Stack spacing={1} direction='row' alignItems='center'>
          <InplaceInput variant='h6' sx={{ flex: 1 }} text={info.name || ''}
            fontSize='large' onConfirm={onChangeName}
          />
          <Typography variant='caption' color='gray'>
            {dayjs(info.create_at).fromNow()}
          </Typography>
          <Chip label={`${info?.users || 0} 个用户`} size='small' variant='outlined' />
          <IconButton color='primary' onClick={print}>
            <PrintIcon fontSize='small' />
          </IconButton>
          <Button color='error' onClick={onDelete}>删除角色</Button>
        </Stack>
        <InplaceInput variant='body2' text={info.summary || ''} multiline
          fontSize='small' onConfirm={onChangeSummary}
        />
      </Stack>
      <Stack spacing={1} direction='row' alignItems='center' mx={3} my={1}>
        <Stack spacing={1} direction='row' alignItems='center' sx={{ flex: 1 }}>
          <Typography variant='caption'>特征：</Typography>
          {(info?.features || []).map(item => (
            <Feature key={item} name={item} />
          ))}
        </Stack>
        <FeatureEditor info={info} setInfo={setInfo} />
      </Stack>
      <Divider />
      <Stack sx={{ mx: 3, my: 2 }}>
        <Stack direction='row' alignItems='center' sx={{ mb: 1 }}>
          <Typography variant='subtitle2' sx={{ flex: 1 }}>
            允许访问 ({info?.allows?.length || 0} 项)
          </Typography>
          <Button onClick={onModifyAllows}>修改权限</Button>
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
              {!info?.allows?.length &&
                <TableRow sx={{ '> td, > th': { border: 0 } }}>
                  <TableCell colSpan={10} align="center">空</TableCell>
                </TableRow>
              }
              {(info?.allows || []).map((row, index) => (
                <TableRow key={row.code} hover
                  sx={{ '> td, > th': { border: 0 } }}>
                  <TableCell align="center" padding='checkbox'>{index + 1}</TableCell>
                  <TableCell align="center">{row.code}</TableCell>
                  <TableCell align="center">{row.title}</TableCell>
                  <TableCell align="center" padding='checkbox'>
                    {row.iread ?
                      <CheckIcon color='success' /> :
                      <BlockIcon color='warning' fontSize='small' />
                    }
                  </TableCell>
                  <TableCell align="center" padding='checkbox'>
                    {row.iwrite ?
                      <CheckIcon color='success' /> :
                      <BlockIcon color='warning' fontSize='small' />
                    }
                  </TableCell>
                  <TableCell align="center" padding='checkbox'>
                    {row.iadmin ?
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

// 特征
function FeatureEditor(props) {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { info, setInfo } = props;
  const features = info?.features || [];

  const onOpen = e => {
    setAnchorEl(e.currentTarget);
  }

  const onClose = () => {
    setAnchorEl(null);
  };

  const onFeatureToggle = async v => {
    try {
      const i = features.indexOf(v);

      if (i === -1) {
        if (v === 'event') {
          let allow = false;

          for (let j = 0; j < info?.allows?.length; j++) {
            if (info.allows[j].code === 9030) {
              allow = true;
              break;
            }
          }
          if (!allow) {
            await confirm({
              description: '当前角色未开启系统事件访问权限，允许该特征将导致该角色可以接收到事件通知，确定要允许吗？',
              confirmationText: '允许',
              confirmationButtonProps: { color: 'warning' },
            });
          }
        }
        features.push(v);
      } else {
        features.splice(i, 1);
      }
      const _audit = `修改访问控制角色 ${info.name} 的特征`;

      await put('/system/acl/features', new URLSearchParams({
        uuid: info?.uuid, features, _audit,
      }));
      setInfo({ ...info, features });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <>
      <IconButton color='primary' onClick={onOpen}>
        <ExpandMoreIcon fontSize='small' />
      </IconButton>
      <Popover onClose={onClose} open={open} anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom', horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top', horizontal: 'left',
        }}>
        <List sx={{ pt: 0 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onFeatureToggle('event')}>
              <Checkbox edge="start" tabIndex={-1} disableRipple
                checked={features.indexOf('event') >= 0}
              />
              <ListItemText primary='事件通知' secondary='开启后可以接收系统事件通知' />
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </>
  )
}

function Feature(props) {
  const { name, ...others } = props;

  let label = '';

  if (name === 'event') {
    label = '事件通知'
  }

  return (
    <Chip {...others}
      label={label} variant='outlined' size='small' color='success'
    />
  )
}
