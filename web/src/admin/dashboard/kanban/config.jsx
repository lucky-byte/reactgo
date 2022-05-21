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
import BorderClearIcon from '@mui/icons-material/BorderClear';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { activedState, outlinedState } from './state';
import nodes from './nodes';

export default function Config() {
  const [activedNodes, setActivedNodes] = useRecoilState(activedState);
  const [outlined, setOutlined] = useRecoilState(outlinedState);
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const rows = nodes.map(node => {
      let _active = false;

      for (let i = 0; i < activedNodes.length; i++) {
        if (activedNodes[i].key === node.key) {
          _active = true;
          break;
        }
      }
      return { ...node, _active };
    })
    setList(rows);
  }, [activedNodes]);

  // 打开抽屉
  const onOpen = () => {
    setOpen(true);
  }

  // 关闭抽屉
  const onClose = () => {
    setOpen(false);
  }

  const onOutlinedClick = () => {
    setOutlined(!outlined);
  }

  // 开关
  const onSwitch = (node, checked) => {
    let newNodes = [];

    if (checked) {
      newNodes = [...activedNodes, node];
    } else {
      for (let i = 0; i < activedNodes.length; i++) {
        if (node.key !== activedNodes[i].key) {
          newNodes.push(activedNodes[i]);
        }
      }
    }
    setActivedNodes(newNodes);

    // 存储到 localStorage 中
    const keys = [];

    for (let i = 0; i < newNodes.length; i++) {
      keys.push(newNodes[i].key);
    }
    localStorage.setItem('kanban-nodes', JSON.stringify(keys));
  }

  return (
    <>
      <Stack direction='row' spacing={2}
        sx={{ position: 'absolute', right: 20, bottom: 20 }}>
        <Tooltip title='边界线'>
          <IconButton onClick={onOutlinedClick}>
            <BorderClearIcon color={outlined ? 'warning' : 'inherit'} />
          </IconButton>
        </Tooltip>
        <Tooltip title='配置'>
          <Fab aria-label="配置" color='info' size='small' onClick={onOpen}>
            <SettingsIcon />
          </Fab>
        </Tooltip>
      </Stack>
      <Drawer anchor='left' open={open} onClose={onClose}>
        <Stack width={250}>
          <Stack direction='row' alignItems='center' spacing={2} pl={2} mt={1}>
            <Typography variant='h6' sx={{ flex: 1 }}>组件配置</Typography>
            <IconButton onClick={onClose} edge='end'>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant='caption' sx={{ px: 2 }}>共 {list.length} 项</Typography>
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
