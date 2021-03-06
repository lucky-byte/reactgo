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

  useTitle('????????????');
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

  // ??????
  const onExport = async () => {
    try {
      await confirm({
        description: `??????????????????????????????????????????????????????????????????????????????`,
        confirmationText: '??????',
      });
      const _audit = '????????????????????????';

      const resp = await post('/system/setting/mail/export',
        new URLSearchParams({ _audit })
      );
      const blob = new Blob([JSON.stringify(resp, null, 2)], {
        type: "text/plain;charset=utf-8"
      });
      saveAs(blob, "mailconfig.json");
      enqueueSnackbar('????????????', { variant: 'success' });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <Stack>
      <Typography variant='h4'>????????????</Typography>
      <Typography variant='body2'>
        ??????????????????????????? SMTP ??????????????????????????????????????????????????????????????????????????????????????????????????????
        ????????????
      </Typography>
      <Stack direction='row' justifyContent='flex-end' sx={{ my: 1 }}>
        <Button component={Link} to='add'>??????</Button>
        <Import requestRefresh={() => setRefresh(true)} />
        <Button color="warning" onClick={onExport}>??????</Button>
      </Stack>
      <TableContainer component={OutlinedPaper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">??????</TableCell>
              <TableCell align="center">?????????</TableCell>
              <TableCell align="center">?????????</TableCell>
              <TableCell align="center">????????????</TableCell>
              <TableCell align="center">?????????</TableCell>
              <TableCell align="center" colSpan={2}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list?.length === 0 &&
              <TableRow disabled>
                <TableCell colSpan={10} align="center">???</TableCell>
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
        ??????????????????(??????QQ??????)??????????????????????????????????????????????????????????????????????????????
        ?????????????????????????????????????????????????????????????????????
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
      const _audit = `??????????????? ${mta.name} ?????? ${dir === 'top' ? '??????' : '??????'}`

      await put('/system/setting/mail/sort', new URLSearchParams({
        uuid: mta.uuid, sortno: mta.sortno, dir, _audit,
      }));
      enqueueSnackbar('????????????', { variant: 'success' });
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

  // ??????/??????
  const onDisableClick = async () => {
    try {
      await confirm({
        description: mta.disabled ?
          `??????????????? ${mta.name} ?????????????????????????????????`
          :
          `??????????????? ${mta.name} ???????????????????????????????????????????????????????????????????????????`,
        confirmationText: mta.disabled ? '??????' : '??????',
        confirmationButtonProps: { color: 'warning' },
        contentProps: { p: 8 },
      });
      const _audit = `${mta.disabled ? '??????' : '??????'} ???????????? ${mta.name}`

      await put('/system/setting/mail/disable', new URLSearchParams({
        uuid: mta.uuid, _audit,
      }));
      enqueueSnackbar('??????????????????', { variant: 'success' });
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
        description: `??????????????? ${mta.name} ??????????????????????????????`,
        confirmationText: '??????',
        confirmationButtonProps: { color: 'error' },
      });
      const token = await secretCode();

      const _audit = `?????????????????? ${mta.name}`

      const params = new URLSearchParams({
        uuid: mta.uuid, secretcode_token: token, _audit,
      });
      await del('/system/setting/mail/delete?' + params.toString());
      enqueueSnackbar('????????????', { variant: 'success' });
      requestRefresh();
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <>
      <IconButton aria-label="??????" onClick={onOpen}>
        <MoreVertIcon color="primary" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose} onClick={onClose}>
        <MenuItem disabled={mta.disabled} onClick={onTest}>
          <ListItemIcon>
            <ForwardToInboxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>??????</ListItemText>
        </MenuItem>
        <MenuItem disabled={mta.disabled} onClick={onModify}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>??????</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => onSort('top')}>
          <ListItemIcon>
            <VerticalAlignTopIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>????????????</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onSort('bottom')}>
          <ListItemIcon>
            <VerticalAlignBottomIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>????????????</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onInfo}>
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>????????????</ListItemText>
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
            <ListItemText>??????</ListItemText>
            :
            <ListItemText>??????</ListItemText>
          }
        </MenuItem>
        <MenuItem onClick={onDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color='error' />
          </ListItemIcon>
          <ListItemText>??????</ListItemText>
        </MenuItem>
      </Menu>
      <Test open={testOpen} onClose={() => setTestOpen(false)} mta={mta} />
    </>
  )
}
