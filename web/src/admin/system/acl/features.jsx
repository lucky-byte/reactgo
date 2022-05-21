import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import { put } from '~/lib/rest';

// 特征
export default function Features(props) {
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { info, setInfo } = props;
  const features = info?.features || [];

  const onOpen = e => {
    setAnchorEl(e.currentTarget);
  }

  const onClose = () => {
    setAnchorEl(null);
  };

  const onFeatureToggle = async v => {
    try {
      const i = features.indexOf(v);

      if (i === -1) {
        if (v === 'event') {
          let allow = false;

          for (let j = 0; j < info?.allows?.length; j++) {
            if (info.allows[j].code === 9030) {
              allow = true;
              break;
            }
          }
          if (!allow) {
            await confirm({
              description: '当前角色未开启系统事件访问权限，允许该特征将导致该角色可以接收到事件通知，确定要允许吗？',
              confirmationText: '允许',
              confirmationButtonProps: { color: 'warning' },
            });
          }
        }
        features.push(v);
      } else {
        features.splice(i, 1);
      }
      const _audit = `修改访问控制角色 ${info.name} 的特征`;

      await put('/system/acl/features', new URLSearchParams({
        uuid: info?.uuid, features, _audit,
      }));
      setInfo({ ...info, features });
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message);
      }
    }
  }

  return (
    <>
      <Stack spacing={1} direction='row' alignItems='center' mx={3} my={1}>
        <Stack spacing={1} direction='row' alignItems='center' sx={{ flex: 1 }}>
          <Typography variant='caption'>特征：</Typography>
          {(info?.features || []).map(item => (
            <Feature key={item} name={item} />
          ))}
        </Stack>
        <IconButton color='primary' onClick={onOpen}>
          <ExpandMoreIcon fontSize='small' />
        </IconButton>
      </Stack>
      <Popover onClose={onClose} open={open} anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom', horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top', horizontal: 'left',
        }}>
        <List sx={{ pt: 0 }} dense>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onFeatureToggle('event')}>
              <Checkbox edge="start" tabIndex={-1} disableRipple
                checked={features.indexOf('event') >= 0}
              />
              <ListItemText primary='事件通知' secondary='开启后可以接收系统事件通知' />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onFeatureToggle('openpt')}>
              <Checkbox edge="start" tabIndex={-1} disableRipple
                checked={features.indexOf('openpt') >= 0}
              />
              <ListItemText primary='开放平台' secondary='开启后仅限于访问开发平台' />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => onFeatureToggle('nologin')}>
              <Checkbox edge="start" tabIndex={-1} disableRipple
                checked={features.indexOf('nologin') >= 0}
              />
              <ListItemText primary='禁止登录' secondary='开启后禁止用户登录本系统' />
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </>
  )
}

const featureNames = {
  'event':   '事件通知',
  'nologin': '禁止登录',
  'openpt':  '开放平台',
}

function Feature(props) {
  const { name, ...others } = props;

  const label = featureNames[name] || '';

  return (
    <Chip {...others}
      label={label} variant='outlined' size='small' color='success'
    />
  )
}
