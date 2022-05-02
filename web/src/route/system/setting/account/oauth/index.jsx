import { useState } from "react";
import Stack from "@mui/material/Stack";
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import AppleIcon from '@mui/icons-material/Apple';
import useTitle from "~/hook/title";
import { useOAuthTab } from '../state';
import Google from '~/img/google.svg';
import Microsoft from '~/img/microsoft.svg';
import Github from "./github";

export default function OAuth() {
  const [anchorEl, setAnchorEl] = useState(null);

  useTitle('身份授权');
  useOAuthTab();

  const helpOpen = Boolean(anchorEl);

  const onHelpOpen = e => {
    setAnchorEl(e.currentTarget);
  }

  const onHelpClose = () => {
    setAnchorEl(null);
  }

  return (
    <Stack sx={{ mt: 2, mb: 3 }}>
      <Typography variant='body2'>
        授权用户使用第三方身份服务商账号登录本系统，
        <Link href="#" underline="hover" onClick={onHelpOpen}>了解更多...</Link>
      </Typography>
      <Paper variant='outlined' sx={{ p: 2, mt: 3 }}>
        <Github />
        <Divider sx={{ my: 2 }} />
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Stack direction='row' spacing={1} alignItems='center'>
            <AppleIcon fontSize='large' />
            <Stack>
              <Typography variant='h6'>Apple</Typography>
              <Typography variant='caption'>未授权</Typography>
            </Stack>
          </Stack>
          <Button variant='contained'>
            授权
          </Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Box width={35} height={35} display='flex' justifyContent='center'>
              <img src={Google} alt='LOGO' style={{ width: 28 }} />
            </Box>
            <Stack>
              <Typography variant='h6'>Google</Typography>
              <Typography variant='caption'>未授权</Typography>
            </Stack>
          </Stack>
          <Button variant='contained' to='secretcode'>
            授权
          </Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Box width={35} height={35} display='flex' justifyContent='center'>
              <img src={Microsoft} alt='LOGO' style={{ width: 28 }} />
            </Box>
            <Stack>
              <Typography variant='h6'>Microsoft</Typography>
              <Typography variant='caption'>未授权</Typography>
            </Stack>
          </Stack>
          <Button variant='contained' to='secretcode'>
            授权
          </Button>
        </Stack>
      </Paper>
      <Popover open={helpOpen} anchorEl={anchorEl} onClose={onHelpClose}
        anchorOrigin={{
          vertical: 'bottom', horizontal: 'center',
        }}
        transformOrigin={{
          horizontal: 'center',
        }}>
        <Typography sx={{ p: 2, maxWidth: 500 }} variant='body2'>
          系统支持用户连接到第三方身份服务提供商的账号，例如用户张三可以连接到其在 GitHub
          网站的账户，连接后张三可以使用其在 GitHub 的账号登录本系统
        </Typography>
      </Popover>
    </Stack>
  )
}
