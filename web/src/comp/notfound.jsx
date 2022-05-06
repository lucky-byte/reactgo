import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useTitle from "~/hook/title";

export default function NotFound() {
  const navigate = useNavigate();

  useTitle('页面不存在');

  const decodedUrl = decodeURIComponent(window.location.href);

  return (
    <Stack alignItems='center' spacing={2} mt={6} px={4}>
      <Typography variant='h6'>页面不存在</Typography>
      <Stack>
        <Typography variant='body1' sx={{ lineBreak: 'anywhere' }}>
          {decodedUrl}
        </Typography>
        {decodedUrl !== window.location.href &&
          <Typography variant='body2' color='gray' sx={{ lineBreak: 'anywhere' }}>
            {window.location.href}
          </Typography>
        }
      </Stack>
      <Stack direction='row' spacing={1}>
        <Button onClick={() => { navigate('/') }} color="secondary">首页</Button>
        <Button onClick={() => { navigate(-1) }}>后退</Button>
      </Stack>
    </Stack>
  )
}
