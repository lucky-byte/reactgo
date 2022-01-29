import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Divider from "@mui/material/Divider";
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import InplaceInput from '../../../../comp/inplace-input';
import OutlinedPaper from '../../../../comp/outlined-paper';
import { get, put, del } from "../../../../rest";

export default function MailSettings() {
  const { enqueueSnackbar } = useSnackbar();
  const [prefix, setPrefix] = useState('');
  const [mtas, setMtas] = useState([]);
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (refresh) {
          const resp = await get('/system/settings/mail');
          setPrefix(resp.mail_prefix);
          setMtas(resp.mtas || []);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setRefresh(false);
      }
    })();
  }, [enqueueSnackbar, refresh]);

  const onChangePrefix = async v => {
    try {
      await put('/system/settings/mail/prefix', new URLSearchParams({
        prefix: v
      }));
      setPrefix(v);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <FormHelperText sx={{ mt: 3 }}>
        标题前缀自动添加到每封邮件的标题之前，通常是公司或产品的名称，
        例如 [XX公司]、[XX产品]，可以为空。
      </FormHelperText>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction='row' alignItems='center'>
          <Typography sx={{ minWidth: 100 }} variant='subtitle2'>
            邮件标题前缀:
          </Typography>
          <InplaceInput text={prefix || ''} onConfirm={onChangePrefix}
            color='primary' sx={{ flex: 1 }}
          />
        </Stack>
      </Paper>
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
                  {mta.host}:{mta.port}/{mta.ssl ? 'ssl' : 'startTLS'}
                </TableCell>
                <TableCell align="center">{mta.sender}</TableCell>
                <TableCell align="center">{mta.nsent}</TableCell>
                <TableCell align="center" padding="checkbox">
                  <MenuButton uuid={mta.uuid} name={mta.name}
                    requestRefresh={setRefresh}
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

  const { uuid, name, requestRefresh } = props;

  const onOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  }

  const onModify = () => {
    onClose();
    navigate('modify', { state: { uuid }});
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
        <MenuItem onClick={onModify}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>修改</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onDelete}>
          <ListItemIcon>
            <RemoveCircleOutlineIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  )
}
