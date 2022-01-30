import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
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
import EditIcon from '@mui/icons-material/Edit';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Divider from "@mui/material/Divider";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import OutlinedPaper from '~/comp/outlined-paper';
import userState from '~/state/user';
import { get, put, post, del } from "~/rest";

export default function MailSettings() {
  const { enqueueSnackbar } = useSnackbar();
  const [mtas, setMtas] = useState([]);
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
          const resp = await get('/system/settings/mail');
          setMtas(resp.mtas || []);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, refresh]);

  return (
    <Stack>
      <Typography sx={{ mt: 3 }} variant='subtitle1'>邮件传输代理:</Typography>
      <FormHelperText sx={{ mb: 0 }}>
        任何支持 SMTP 协议的邮件服务器，例如 QQ 邮箱、GMail、Outlook 等都可以使用，
        前提是你需要一个有效的账号，例如你的 QQ 邮箱账号。
        你可以配置多个邮件传输代理，系统将在第一个服务器发送失败的情况下使用第二个，依此类推。
        <br />
        请注意: 公共的（尤其是免费的）邮件服务器（例如QQ邮箱）有发送频率限制，
        如果系统需要发送大量邮件，需使用专用的邮件服务，或配置自己的邮件传输代理。
      </FormHelperText>
      <Button sx={{ alignSelf: 'flex-end', mb: 1 }} component={Link} to='add'>
        添加
      </Button>
      <TableContainer component={OutlinedPaper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">名称</TableCell>
              <TableCell align="center">服务器</TableCell>
              <TableCell align="center">发件人</TableCell>
              <TableCell align="center">发送量</TableCell>
              <TableCell align="center" padding="checkbox"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mtas.map(mta => (
              <TableRow key={mta.uuid}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">{mta.name}</TableCell>
                <TableCell align="center">
                  {mta.host}:{mta.port}/{mta.ssl ? 'SSL' : 'StartTLS'}
                </TableCell>
                <TableCell align="center">{mta.sender}</TableCell>
                <TableCell align="center">{mta.nsent},{mta.sortno}</TableCell>
                <TableCell align="center" padding="checkbox">
                  <MenuButton uuid={mta.uuid} name={mta.name} sortno={mta.sortno}
                    requestRefresh={() => setRefresh(true)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

function MenuButton(props) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [testOpen, setTestOpen] = useState(false);

  const { uuid, name, sortno, requestRefresh } = props;

  const onOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  }

  const onSort = async dir => {
    try {
      await put('/system/settings/mail/sort', new URLSearchParams({
        uuid, dir, sortno,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      onClose();
    }
  }

  const onModify = () => {
    onClose();
    navigate('modify', { state: { uuid }});
  }

  const onTest = () => {
    onClose();
    setTestOpen(true);
  }

  const onDelete = async () => {
    try {
      await confirm({
        description: `确定要删除 ${name} 吗？删除后不能恢复。`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });
      const params = new URLSearchParams({ uuid });
      await del('/system/settings/mail/delete?' + params.toString());
      enqueueSnackbar('删除成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    } finally {
      onClose();
    }
  }

  return (
    <div>
      <IconButton onClick={onOpen}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
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
            <RemoveCircleOutlineIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
      <TestDialog open={testOpen} onClose={() => setTestOpen(false)}
        uuid={uuid} name={name}
      />
    </div>
  )
}

function TestDialog(props) {
  const { enqueueSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);
  const [disabled, setDisabled] = useState(false);

  const { open, onClose, name, uuid } = props;

  const onConfirm = async () => {
    try {
      setDisabled(true);

      await post('/system/settings/mail/test', new URLSearchParams({
        uuid, email: user.email,
      }));
      enqueueSnackbar('邮件已发送', { variant: 'success' });
      onClose();
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setDisabled(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs'>
      <DialogTitle>发送测试邮件</DialogTitle>
      <DialogContent>
        <DialogContentText>通过 <em>{name}</em> 发送测试邮件</DialogContentText>
        <FormHelperText sx={{ mt: 1 }}>
          点击「发送」将发送一封测试邮件到下面的邮箱地址，成功收到邮件表明配置正确。
        </FormHelperText>
        <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
          <Typography variant="body2">{user.email}</Typography>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" disabled={disabled} onClick={onConfirm}>
          发送
        </Button>
      </DialogActions>
    </Dialog>
  )
}
