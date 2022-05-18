import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PrintIcon from '@mui/icons-material/Print';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import usePrint from "~/hook/print";
import InplaceInput from '~/comp/inplace-input';
import TimeAgo from '~/comp/timeago';
import { del, put } from '~/lib/rest';
import Features from './features';

export default function Info(props) {
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
          return { ...a, name: value }
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
    navigate('allows', {
      state: {
        acl: info.uuid, name: info.name, summary: info.summary,
      }
    });
  }

  return (
    <Paper variant='outlined' sx={{ flex: 1 }} ref={contentRef}>
      <Stack sx={{ mx: 3, my: 1 }}>
        <Stack spacing={0} direction='row' alignItems='center'>
          <InplaceInput variant='h6' sx={{ flex: 1 }} text={info.name || ''}
            fontSize='large' onConfirm={onChangeName}
          />
          <Chip label={`${info.users || 0} 个用户`} size='small' variant='outlined' />
          <Chip label={`${info.code}`} size='small' sx={{ ml: 1 }} />
          <TimeAgo time={info.create_at} sx={{ mx: 1 }} />

          <IconButton color='primary' onClick={print}>
            <PrintIcon fontSize='small' />
          </IconButton>
          <Button color='error' onClick={onDelete}>删除角色</Button>
        </Stack>
        <InplaceInput variant='body2' text={info.summary || ''} multiline
          fontSize='small' onConfirm={onChangeSummary} sx={{ flex: 1 }}
        />
      </Stack>
      <Features info={info} setInfo={setInfo} />
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
