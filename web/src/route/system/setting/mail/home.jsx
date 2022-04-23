import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { useNavigate, Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EditIcon from '@mui/icons-material/Edit';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from "@mui/material/Divider";
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import { saveAs } from 'file-saver';
import OutlinedPaper from '~/comp/outlined-paper';
import { useSecretCode } from '~/comp/secretcode';
import useTitle from "~/hook/title";
import progressState from '~/state/progress';
import { get, put, del } from "~/rest";
import { useMailTab } from '../state';
import Import from "./import";
import Test from "./test";

export default function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const setProgress = useSetRecoilState(progressState);
  const [list, setList] = useState([]);
  const [refresh, setRefresh] = useState(true);

  useTitle('邮件服务');
  useMailTab();

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
          setProgress(true);
          const resp = await get('/system/setting/mail/list');
          setList(resp.list || []);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, refresh, setProgress]);

  // 导出
  const onExport = async () => {
    try {
      await confirm({
        description: `导出的文件中将包含账号、密码、等敏感信息，请妥善保管。`,
        confirmationText: '导出',
      });
      const resp = await get('/system/setting/mail/export');
      const blob = new Blob([JSON.stringify(resp, null, 2)], {
        type: "text/plain;charset=utf-8"
      });
      saveAs(blob, "mail-config.json");
      enqueueSnackbar('导出成功', { variant: 'success' });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Stack>
      <Typography variant='h4'>邮件服务</Typography>
      <Typography variant='body2'>
        你可以配置多个支持 SMTP 协议的邮件传输代理，系统将在第一个服务器发送失败的情况下使用第二个，
        依此类推
      </Typography>
      <Stack direction='row' justifyContent='flex-end' sx={{ my: 1 }}>
        <Button component={Link} to='add'>添加</Button>
        <Import requestRefresh={() => setRefresh(true)} />
        <Button color="warning" onClick={onExport}>导出</Button>
      </Stack>
      <TableContainer component={OutlinedPaper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">名称</TableCell>
              <TableCell align="center">服务器</TableCell>
              <TableCell align="center">发件人</TableCell>
              <TableCell align="center">发信量</TableCell>
              <TableCell align="center" padding="none"></TableCell>
              <TableCell as='td' align="center" padding="checkbox" />
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map(m => (
              <TableRow key={m.uuid} disabled={m.disabled}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">{m.name}</TableCell>
                <TableCell align="center">{m.host}:{m.port}</TableCell>
                <TableCell align="center">{m.sender}</TableCell>
                <TableCell align="center">{m.nsent}</TableCell>
                <TableCell align="center" padding="none">
                  {m.disabled &&
                    <BlockIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
                  }
                </TableCell>
                <TableCell align="center" padding="checkbox" className="action">
                  <MenuButton uuid={m.uuid} name={m.name} sortno={m.sortno}
                    disabled={m.disabled}
                    requestRefresh={() => setRefresh(true)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormHelperText sx={{ mb: 0 }}>
        公共邮件服务(例如QQ邮箱)通常有严格的发送频率限制，如果系统需要发送大量邮件，
        请使用专用邮件服务商，或架设自己专属的邮件服务
      </FormHelperText>
    </Stack>
  )
}

function MenuButton(props) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const secretCode = useSecretCode();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState(null);
  const [testOpen, setTestOpen] = useState(false);

  const open = Boolean(anchorEl);

  const { uuid, name, sortno, disabled, requestRefresh } = props;

  const onOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  }

  const onSort = async dir => {
    try {
      await put('/system/setting/mail/sort', new URLSearchParams({
        uuid, dir, sortno,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onInfo = () => {
    navigate('info', { state: { uuid } });
  }

  const onModify = () => {
    navigate('modify', { state: { uuid } });
  }

  const onTest = () => {
    setTestOpen(true);
  }

  // 禁用/启用
  const onDisableClick = async () => {
    try {
      await confirm({
        description: disabled ?
          `确定要恢复 ${name} 吗？恢复后可正常使用。`
          :
          `确定要禁用 ${name} 吗？禁用后该邮件服务不可以继续使用，直到恢复为止。`,
        confirmationText: disabled ? '恢复' : '禁用',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      await put('/system/setting/mail/disable', new URLSearchParams({ uuid }));
      enqueueSnackbar('状态更新成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  const onDelete = async () => {
    try {
      await confirm({
        description: `确定要删除 ${name} 吗？删除后无法恢复。`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });
      const token = await secretCode();

      const params = new URLSearchParams({ uuid, secretcode_token: token });
      await del('/system/setting/mail/delete?' + params.toString());
      enqueueSnackbar('删除成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <>
      <IconButton aria-label="菜单" onClick={onOpen}>
        <MoreVertIcon color="primary" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose} onClick={onClose}>
        <MenuItem onClick={onInfo}>
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>详细信息</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => onSort('top')}>
          <ListItemIcon>
            <VerticalAlignTopIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>移到最前</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onSort('bottom')}>
          <ListItemIcon>
            <VerticalAlignBottomIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>移到最后</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled={disabled} onClick={onModify}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>修改</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled={disabled} onClick={onTest}>
          <ListItemIcon>
            <ForwardToInboxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>发送测试邮件</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onDisableClick}>
          <ListItemIcon>
            {disabled ?
              <SettingsBackupRestoreIcon fontSize="small" color='warning' />
              :
              <BlockIcon fontSize="small" color='warning' />
            }
          </ListItemIcon>
          {disabled ?
            <ListItemText>恢复</ListItemText>
            :
            <ListItemText>禁用</ListItemText>
          }
        </MenuItem>
        <MenuItem onClick={onDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
      <Test open={testOpen} onClose={() => setTestOpen(false)}
        uuid={uuid} name={name}
      />
    </>
  )
}
