import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { useNavigate, Link } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
import { useAccountTab } from '../state';
import { get, put, del } from "~/rest";

export default function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const setProgress = useSetRecoilState(progressState);
  const [tab, setTab] = useState(1);
  const [list, setList] = useState([]);
  const [refresh, setRefresh] = useState(true);

  useTitle('账号设置');
  useAccountTab();

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
    <Stack spacing={3}>
      <Typography variant='h4'>账号设置</Typography>
      <Paper sx={{ px: 3, py: 2 }}>
      <Tabs value={tab} onChange={v => setTab(v)} aria-label="账号设置">
        <Tab value={1} label="登录及会话" />
        <Tab value={2} label="OIDC 身份认证" />
        <Tab value={3} label="SAML 单点登录" />
      </Tabs>
      </Paper>
    </Stack>
  )
}
