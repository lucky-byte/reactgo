import { useState } from "react";
import Stack from "@mui/material/Stack";
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import useTitle from "~/hook/title";
import { useOAuthTab } from "../state";
import Github from "./github";
import Google from "./google";
import Microsoft from "./microsoft";

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
        身份授权可以让用户授权第三方身份服务商账号登录本系统，
        <Link href="#" underline="hover" onClick={onHelpOpen}>了解更多...</Link>
      </Typography>
      <Paper variant='outlined' sx={{ mt: 3 }}>
        <Github />
        <Divider />
        <Google />
        <Divider />
        <Microsoft />
      </Paper>
      <Popover open={helpOpen} anchorEl={anchorEl} onClose={onHelpClose}
        anchorOrigin={{
          vertical: 'bottom', horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top', horizontal: 'center',
        }}>
        <Typography sx={{ p: 2, maxWidth: 500 }} variant='body2'>
          系统支持 OAuth/OpenID Connect 协议让用户关联第三方身份提供商账号，
          例如用户张三可以关联其在 GitHub 网站的账号，关联后张三可以使用其 GitHub
          账号登录本系统
        </Typography>
      </Popover>
    </Stack>
  )
}
