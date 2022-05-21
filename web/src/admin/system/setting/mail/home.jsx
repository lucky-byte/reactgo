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
import dayjs from 'dayjs';
import OutlinedPaper from '~/comp/outlined-paper';
import { useSecretCode } from '~/comp/secretcode';
import useTitle from "~/hook/title";
import progressState from '~/state/progress';
import { get, post, put, del } from "~/lib/rest";
import { useMailTab } from '../tabstate';
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
        description: `导出的文件中将包含账号、密码等敏感信息，请妥善保管。`,
        confirmationText: '导出',
      });
      const _audit = '导出邮件服务配置';

      const resp = await post('/system/setting/mail/export',
        new URLSearchParams({ _audit })
      );
      const blob = new Blob([JSON.stringify(resp, null, 2)], {
        type: "text/plain;charset=utf-8"
      });
      saveAs(blob, "mailconfig.json");
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
              <TableCell align="center">创建时间</TableCell>
              <TableCell align="center">发信量</TableCell>
              <TableCell align="center" colSpan={2}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list?.length === 0 &&
              <TableRow disabled>
                <TableCell colSpan={10} align="center">空</TableCell>
              </TableRow>
            }
            {list.map(item => (
              <TableRow key={item.uuid} disabled={item.disabled}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">{item.name}</TableCell>
                <TableCell align="center">{item.host}:{item.port}</TableCell>
                <TableCell align="center">{item.sender}</TableCell>
                <TableCell align="center">
                  {dayjs(item.create_at).format('LL')}
                </TableCell>
                <TableCell align="center">{item.nsent}</TableCell>
                <TableCell align="center" padding="none">
                  {item.disabled &&
                    <BlockIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
                  }
                </TableCell>
                <TableCell align="center" padding="none" className="action">
                  <MenuButton mta={item} requestRefresh={() => setRefresh(true)} />
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

  const { mta, requestRefresh } = props;

  const onOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  }

  const onSort = async dir => {
    try {
      const _audit = `将邮件服务 ${mta.name} 移到 ${dir === 'top' ? '最前' : '最后'}`

      await put('/system/setting/mail/sort', new URLSearchParams({
        uuid: mta.uuid, sortno: mta.sortno, dir, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onInfo = () => {
    navigate('info', { state: { uuid: mta.uuid } });
  }

  const onModify = () => {
    navigate('modify', { state: { uuid: mta.uuid } });
  }

  const onTest = () => {
    setTestOpen(true);
  }

  // 禁用/启用
  const onDisableClick = async () => {
    try {
      await confirm({
        description: mta.disabled ?
          `确定要恢复 ${mta.name} 吗？恢复后可正常使用。`
          :
          `确定要禁用 ${mta.name} 吗？禁用后该邮件服务不可以继续使用，直到恢复为止。`,
        confirmationText: mta.disabled ? '恢复' : '禁用',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      const _audit = `${mta.disabled ? '恢复' : '禁用'} 邮件服务 ${mta.name}`

      await put('/system/setting/mail/disable', new URLSearchParams({
        uuid: mta.uuid, _audit,
      }));
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
        description: `确定要删除 ${mta.name} 吗？删除后无法恢复。`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });
      const token = await secretCode();

      const _audit = `删除邮件服务 ${mta.name}`

      const params = new URLSearchParams({
        uuid: mta.uuid, secretcode_token: token, _audit,
      });
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
        <MenuItem disabled={mta.disabled} onClick={onTest}>
          <ListItemIcon>
            <ForwardToInboxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>测试</ListItemText>
        </MenuItem>
        <MenuItem disabled={mta.disabled} onClick={onModify}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>修改</ListItemText>
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
        <MenuItem onClick={onInfo}>
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>详细信息</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onDisableClick}>
          <ListItemIcon>
            {mta.disabled ?
              <SettingsBackupRestoreIcon fontSize="small" color='warning' />
              :
              <BlockIcon fontSize="small" color='warning' />
            }
          </ListItemIcon>
          {mta.disabled ?
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
      <Test open={testOpen} onClose={() => setTestOpen(false)} mta={mta} />
    </>
  )
}
