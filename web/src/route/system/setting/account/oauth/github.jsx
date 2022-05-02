import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';
import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';
import { useSnackbar } from 'notistack';
import { useSecretCode } from '~/comp/secretcode';
import { get, put } from "~/rest";

export default function Github() {
  const { enqueueSnackbar } = useSnackbar();
  const secretCode = useSecretCode();
  const [open, setOpen] = useState(false);
  const [enable, setEnable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/setting/account/');
        setEnable(true);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  // 打开设置
  const onSetting = () => {
    setOpen(true);
  }

  return (
    <Stack direction='row' alignItems='center'>
      <Stack direction='row' spacing={2} alignItems='center' flex={1}>
        <GitHubIcon fontSize='large' />
        <Stack>
          <Stack direction='row' alignItems='center' spacing={3}>
            <Typography variant='h6'>GitHub</Typography>
            {enable ?
              <Chip icon={<CheckIcon />}
                label="已启用" size="small" variant="outlined" color="success"
              />
              :
              <Chip icon={<BlockIcon />}
                label="未启用" variant="outlined" size="small"
              />
            }
          </Stack>
          <Typography variant='caption'>已绑定 23 个用户</Typography>
        </Stack>
      </Stack>
      <Button variant='contained' disableElevation onClick={onSetting}>
        设置
      </Button>
    </Stack>
  )
}
