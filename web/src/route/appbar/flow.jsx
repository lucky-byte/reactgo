import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddTaskIcon from '@mui/icons-material/AddTask';

export default function Flow() {
  return (
    <>
      <Tooltip title='工作流' arrow>
        <IconButton aria-label="工作流" color="primary">
          <AddTaskIcon />
        </IconButton>
      </Tooltip>
    </>
  )
}
