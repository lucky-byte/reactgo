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
import ListAltIcon from '@mui/icons-material/ListAlt';
import EditIcon from '@mui/icons-material/Edit';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Divider from "@mui/material/Divider";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import { saveAs } from 'file-saver';
import OutlinedPaper from '~/comp/outlined-paper';
import { useSecretCode } from '~/comp/secretcode';
import userState from '~/state/user';
import { get, put, post, del } from "~/rest";

export default function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [mtas, setMtas] = useState([]);
  const [refresh, setRefresh] = useState(true);
  const [importOpen, setImportOpen] = useState(false);

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

  // 导入
  const onImport = () => {
    setImportOpen(true);
  }

  // 导出
  const onExport = async () => {
    try {
      await confirm({
        description: `导出的文件中将包含账号、密码、等敏感信息，请妥善保管。`,
        confirmationText: '导出',
      });
      const resp = await get('/system/settings/mail/export');
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
      <Typography sx={{ mt: 3 }} variant='subtitle1'>邮件传输代理</Typography>
      <FormHelperText sx={{ mb: 0 }}>
        任何支持 SMTP 协议的邮件服务器，例如 QQ 邮箱、GMail、Outlook 等都可以使用，
        前提是你需要一个有效的账号，例如你的 QQ 邮箱账号。
        你可以配置多个邮件传输代理，系统将在第一个服务器发送失败的情况下使用第二个，依此类推。
        <br />
        请注意: 公共的（尤其是免费的）邮件服务器（例如QQ邮箱）有发送频率限制，
        如果系统需要发送大量邮件，需使用专用的邮件服务，或配置自己的邮件传输代理。
      </FormHelperText>
      <Stack direction='row' justifyContent='flex-end' sx={{ mb: 1 }}>
        <Button component={Link} to='add'>添加</Button>
        <Button color="warning" onClick={onImport}>导入</Button>
        <Button color="warning" onClick={onExport}>导出</Button>
      </Stack>
      <TableContainer component={OutlinedPaper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">名称</TableCell>
              <TableCell align="center">服务器</TableCell>
              <TableCell align="center">发件人</TableCell>
              <TableCell align="center">发送量</TableCell>
              <TableCell as='td' align="center" padding="checkbox" />
            </TableRow>
          </TableHead>
          <TableBody>
            {mtas.map(mta => (
              <TableRow key={mta.uuid}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">{mta.name}</TableCell>
                <TableCell align="center">{mta.host}:{mta.port}</TableCell>
                <TableCell align="center">{mta.sender}</TableCell>
                <TableCell align="center">{mta.nsent}</TableCell>
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
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)}
        requestRefresh={() => setRefresh(true)}
      />
    </Stack>
  )
}

function MenuButton(props) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const secretCode= useSecretCode();
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
      onClose();

      await put('/system/settings/mail/sort', new URLSearchParams({
        uuid, dir, sortno,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  const onInfo = () => {
    onClose();
    navigate('info', { state: { uuid }});
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
      onClose();

      await confirm({
        description: `确定要删除 ${name} 吗？删除后无法恢复。`,
        confirmationText: '删除',
        confirmationButtonProps: { color: 'error' },
      });

      const token = await secretCode();

      const params = new URLSearchParams({ uuid, secretcode_token: token });
      await del('/system/settings/mail/delete?' + params.toString());
      enqueueSnackbar('删除成功', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <div>
      <IconButton aria-label="菜单" onClick={onOpen}>
        <MoreVertIcon color="primary" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
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

// 发送测试邮件
function TestDialog(props) {
  const { enqueueSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);
  const [disabled, setDisabled] = useState(false);

  const { open, onClose, name, uuid } = props;

  const onConfirm = async () => {
    try {
      setDisabled(true);

      await post('/system/settings/mail/test', new URLSearchParams({
        uuid, email: user?.email,
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
          <Typography variant="body2">{user?.email}</Typography>
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

// 导入
function ImportDialog(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [disabled, setDisabled] = useState(false);

  const { open, onClose, requestRefresh } = props;

  const onDialogClose = () => {
    setFile(null);
    setFilename('');
    onClose();
  }

  // 改变导入文件
  const onFileChange = e => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return setFilename('');
    }
    const file = e.target.files[0];

    if (file.size > 1024 * 10) {
      return enqueueSnackbar('文件大小超出范围', { variant: 'error' });
    }
    setFile(file);
    setFilename(file.name);
  }

  // 确定导入
  const onConfirm = async () => {
    if (!file) {
      return enqueueSnackbar('请选择导入文件', { variant: 'warning' });
    }
    try {
      setDisabled(true);

      const form = new FormData();
      form.append("file", file);

      await post('/system/settings/mail/import', form);

      enqueueSnackbar('导入成功', { variant: 'success' });
      onDialogClose();
      requestRefresh();
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setDisabled(false);
    }
  }

  return (
    <Dialog open={open} onClose={onDialogClose} maxWidth='xs'>
      <DialogTitle>导入配置</DialogTitle>
      <DialogContent>
        <DialogContentText>
          导入文件格式必须与导出的文件格式一致。一般的操作流程是先导出文件备份，后续再进行导入。
        </DialogContentText>
        <TextField fullWidth disabled focused sx={{ mt: 3 }}
          label='导入文件'
          placeholder="请选择"
          value={filename}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <input id="importfile" accept="application/json" type="file"
                  hidden onChange={onFileChange}
                />
                <Button htmlFor='importfile' component="label">
                  选择文件
                </Button>
              </InputAdornment>
          }}
        />
        <FormHelperText>
          导入文件中<strong>名称</strong>相同的记录会被忽略。
        </FormHelperText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onDialogClose}>取消</Button>
        <Button variant="contained" disabled={disabled} onClick={onConfirm}>
          导入
        </Button>
      </DialogActions>
    </Dialog>
  )
}
