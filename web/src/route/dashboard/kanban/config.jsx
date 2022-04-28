import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import panels from './panels';

export default function Config() {
  const [open, setOpen] = useState(false);

  // 打开抽屉
  const onOpen = () => {
    setOpen(true);
  }

  // 关闭抽屉
  const onClose = () => {
    setOpen(false);
  }

  return (
    <>
      <Tooltip title='配置'>
        <Fab color="primary" aria-label="添加" size='small' onClick={onOpen}
          sx={{ position: 'absolute', right: 20, bottom: 20 }}>
          <SettingsIcon />
        </Fab>
      </Tooltip>
      <Drawer anchor='left' open={open} onClose={onClose}>
        <Stack width={250}>
          <Stack direction='row' alignItems='center' spacing={2} p={1}>
            <SettingsIcon />
            <Typography variant='h6' sx={{ flex: 1 }}>配置</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <List>
            {panels.map(item => (
            <ListItem key={item.key} divider>
              <ListItemText primary={item.title} secondary={item.desc}
                  secondaryTypographyProps={{ variant: 'caption' }}
              />
              <Switch
                edge="end"
                // onChange={handleToggle('wifi')}
                // checked={checked.indexOf('wifi') !== -1}
                inputProps={{ 'aria-labelledby': '开关' }}
              />
            </ListItem>
            ))}
          </List>
        </Stack>
      </Drawer>
    </>
  )
}
