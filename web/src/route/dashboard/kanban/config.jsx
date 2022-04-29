import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import panelList from './panels';
import kanbanState from './state';

export default function Config() {
  const [panels, setPanels] = useRecoilState(kanbanState);
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const all = [];

    for (let i = 0; i < panelList.length; i++) {
      all[i] = { ...panelList[i], _active: false };

      for (let j = 0; j < panels.length; j++) {
        if (panels[j].key === all[i].key) {
          all[i]._active = true;
          break;
        }
      }
    }
    setList(all);
  }, [panels]);

  // 打开抽屉
  const onOpen = () => {
    setOpen(true);
  }

  // 关闭抽屉
  const onClose = () => {
    setOpen(false);
  }

  // 开关
  const onSwitch = (item, checked) => {
    if (checked) {
      return setPanels([item, ...panels]);
    }
    const newpanels = [...panels]

    for (let i = 0; i < newpanels.length; i++) {
      if (item.key === newpanels[i].key) {
        newpanels.splice(i, 1);
        break;
      }
    }
    setPanels(newpanels);
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
            {list.map(item => (
              <ListItem key={item.key} divider>
                <ListItemText primary={item.title} secondary={item.desc}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Switch edge="end"
                  onChange={e => onSwitch(item, e.target.checked)}
                  checked={item._active}
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
