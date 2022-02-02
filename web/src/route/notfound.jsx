import { useEffect } from 'react';
import { useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import titleState from "~/state/title";

export default function NotFound() {
  const navigate = useNavigate();
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle('页面不存在'); }, [setTitle]);

  return (
    <Stack alignItems='center' spacing={1}>
      <Typography variant='body1' mt={8}>你访问的页面不存在</Typography>
      <Stack direction='row' sx={{ mt: 0 }} spacing={2}>
        <Button onClick={() => { navigate('/') }} color="secondary">
          首页
        </Button>
        <Button onClick={() => { window.history.back(); }}>
          后退
        </Button>
      </Stack>
    </Stack>
  )
}
