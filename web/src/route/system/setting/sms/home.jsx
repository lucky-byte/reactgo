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
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from "@mui/material/Divider";
import { useSnackbar } from 'notistack';
import { useConfirm } from 'material-ui-confirm';
import { saveAs } from 'file-saver';
import OutlinedPaper from '~/comp/outlined-paper';
import { useSecretCode } from '~/comp/secretcode';
import useTitle from "~/hook/title";
import progressState from '~/state/progress';
import { useSMSTab } from '../state';
import { get, put, del } from "~/rest";
import { Paper } from "@mui/material";

export default function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const setProgress = useSetRecoilState(progressState);
  const [list, setList] = useState([]);
  const [refresh, setRefresh] = useState(true);

  useTitle('短信服务');
  useSMSTab(1);

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
      <Paper elevation={1} sx={{ px: 4, py: 3 }}>
    <Stack>
      <Typography variant='h4'>短信服务</Typography>
      <Typography variant='body2'>
        系统通过短信发送验证码等信息，请从下面选择一个短信服务商进行配置
      </Typography>
      <Paper variant='outlined' sx={{ p: 2, mt: 3 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Stack>
                <Typography variant='h6'>GitHub</Typography>
                <Typography variant='caption'>未授权</Typography>
              </Stack>
            </Stack>
            <Button variant='contained'>
              授权
            </Button>
          </Stack>
      </Paper>
    </Stack>
      </Paper>
  )
}
