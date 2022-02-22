import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Switch from '@mui/material/Switch';
import FormHelperText from "@mui/material/FormHelperText";
import { useSnackbar } from 'notistack';
import { get, put } from "~/rest";

export default function Generic() {
  const { enqueueSnackbar } = useSnackbar();
  const [bugReport, setBugReport] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/settings/generic/config');
        setBugReport(resp.bugreport);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  // 帮助改进产品
  const onBugReportCheck = async () => {
    try {
      await put('/system/settings/generic/bugreport', new URLSearchParams({
        bugreport: !bugReport
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setBugReport(!bugReport);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Stack direction='row' alignItems='center'>
          <Stack sx={{ flex: 1 }}>
            <Typography>帮助我们改进产品功能和性能</Typography>
            <FormHelperText>
              自动将使用情况统计信息和崩溃报告发送至产品质量监测平台
            </FormHelperText>
          </Stack>
          <Switch checked={bugReport} onChange={onBugReportCheck}
            inputProps={{ 'aria-label': '开关' }}
          />
        </Stack>
      </Paper>
    </Stack>
  )
}
