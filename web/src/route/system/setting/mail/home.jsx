import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { useNavigate, Link } from "react-router-dom";
import Paper from "@mui/material/Paper";
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
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from "@mui/material/Divider";
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import { saveAs } from 'file-saver';
import OutlinedPaper from '~/comp/outlined-paper';
import { useSecretCode } from '~/comp/secretcode';
import useTitle from "~/hook/title";
import progressState from '~/state/progress';
import { useMailTab } from '../state';
import { get, put, del } from "~/rest";
import Import from "./import";
import Test from "./test";

export default function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const setProgress = useSetRecoilState(progressState);
  const [list, setList] = useState([]);
  const [refresh, setRefresh] = useState(true);

  useTitle('邮件服务');
  useMailTab(1);

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
      <Paper sx={{ px: 3, py: 3, mt: 3 }}>
        <Stack direction='row' justifyContent='flex-end' sx={{ mb: 1 }}>
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
                <TableCell as='td' align="center" padding="checkbox" />
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map(m => (
                <TableRow key={m.uuid}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell align="center">{m.name}</TableCell>
                  <TableCell align="center">{m.host}:{m.port}</TableCell>
                  <TableCell align="center">{m.sender}</TableCell>
                  <TableCell align="center">{m.nsent}</TableCell>
                  <TableCell align="center" padding="checkbox">
                    <MenuButton uuid={m.uuid} name={m.name} sortno={m.sortno}
                      requestRefresh={() => setRefresh(true)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {list?.length === 0 &&
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell colSpan={9} align="center">空</TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <FormHelperText sx={{ mb: 0 }}>
        请注意: 公共的邮件服务器(例如QQ邮箱)有发送频率限制，
        如果系统需要发送大量邮件，需使用专用的邮件服务，或配置自己的邮件传输代理
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

  const { uuid, name, sortno, requestRefresh } = props;

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
        <MenuItem onClick={onModify}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>修改</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onTest}>
          <ListItemIcon>
            <ForwardToInboxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>发送测试邮件</ListItemText>
        </MenuItem>
        <Divider />
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
