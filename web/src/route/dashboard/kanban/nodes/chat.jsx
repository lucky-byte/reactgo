import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function Chat() {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle2">最近联系人</Typography>
      <Button fullWidth variant="outlined" size="small" color="success">
        发起新会话
      </Button>
    </Paper>
  )
}
