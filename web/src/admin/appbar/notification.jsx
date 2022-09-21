import { useEffect, useState, useCallback } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Stack from "@mui/material/Stack";
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from "@mui/material/Divider";
import NotificationsIcon from '@mui/icons-material/Notifications';
import CampaignIcon from '@mui/icons-material/Campaign';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import SettingIcon from '@mui/icons-material/Settings';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from "uuid";
import Push from 'push.js';
import nats from '~/lib/nats';
import userState from "~/state/user";
import natsState from "~/state/nats";
import EllipsisText from "~/comp/ellipsis-text";
import TimeAgo from '~/comp/timeago';
import latestNotificationState from "~/state/notification";
import { notificationOutdatedState } from "~/state/notification";
import { get } from "~/lib/rest";

export default function Notification() {
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);
  const [latest, setLatest] = useRecoilState(latestNotificationState);
  const [outdated, setOutdated] = useRecoilState(notificationOutdatedState);
  const natsChange = useRecoilValue(natsState);
  const [anchorEl, setAnchorEl] = useState(null);

  // 更新未读通知数量以及最近通知
  useEffect(() => {
    (async () => {
      try {
        if (user?.uuid && outdated) {
          const resp = await get('/user/notification/last');

          setLatest({ last: resp.last || [], unread: resp.unread });
          setOutdated(false);
        }
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar, setLatest, outdated, setOutdated, user?.uuid]);

  // 弹出提示信息
  const popupMessage = useCallback((variant, title, url) => {
    enqueueSnackbar(title, {
      variant: variant,
      preventDuplicate: true,
      autoHideDuration: 10000,
      anchorOrigin: {
        horizontal: 'right', vertical: 'top',
      },
      action: (
        <>
          <IconButton LinkComponent='a' href={url} target='_blank'
            onClick={() => { closeSnackbar() }}>
            <MoreHorizIcon sx={{ color: 'white' }} />
          </IconButton>
          <IconButton onClick={() => { closeSnackbar() }}>
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
        </>
      )
    });
  }, [enqueueSnackbar, closeSnackbar]);

  // 弹出浏览器通知
  const pushNotification = title => {
    if (!Push.Permission.has()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('浏览器通知权限拒绝');
      }
      return;
    }
    const tag = uuidv4();

    Push.create(title, {
      icon: '/logo192.png',
      body: '点击查看详情',
      tag: tag,
      timeout: 1000 * 600,
      vibrate: [200, 100, 200, 100],
      link: '/user/notification',
      onClick: () => {
        window.focus();
        Push.close(tag);
      },
    });
  }

  // 订阅系统事件通知
  useEffect(() => {
    const broker = nats.getBroker();
    if (!broker) {
      return;
    }
    // 用户角色没有接收事件通知的特征
    if (user?.acl_features?.indexOf('event') < 0) {
      return;
    }
    let sub = null;

    (async () => {
      try {
        sub = broker.subscribe("reactgo.system.event");
        const codec = await nats.JSONCodec();

        // 循环收到事件通知
        for await (const m of sub) {
          const event = codec.decode(m.data);

          // 弹出提醒，如果用户允许的话
          if (user?.noti_popup) {
            const variants = ['', 'info', 'warning', 'error'];
            const variant = variants[event.level] || 'default';
            popupMessage(variant, event.title, '/system/event');
          }
          // 弹出浏览器通知，如果用户允许的话
          if (user?.noti_browser) {
            pushNotification(event.title);
          }
        }
      } catch (err) {
        enqueueSnackbar(err.message || '连接消息通道失败');
      }
    })();

    // 取消订阅
    return () => { sub && sub.unsubscribe(); }
  }, [
    enqueueSnackbar, popupMessage, natsChange,
    user?.acl_features, user?.noti_popup, user?.noti_browser,
  ]);

  // 订阅用户通知
  useEffect(() => {
    if (!user?.uuid) {
      return;
    }
    const broker = nats.getBroker();
    if (!broker) {
      return;
    }
    let sub = null;

    (async () => {
      try {
        sub = broker.subscribe("reactgo.user.notification." + user.uuid);
        const codec = await nats.JSONCodec();

        for await (const m of sub) {
          const n = codec.decode(m.data);

          if (n.type > 0) {
            if (user?.noti_popup) {
              popupMessage('success', n.title, '/user/notification');
            }
            if (user?.noti_browser) {
              pushNotification(n.title);
            }
          }
          // 更新最近通知
          setOutdated(true);
        }
      } catch (err) {
        enqueueSnackbar(err.message || '连接消息通道失败');
      }
    })();

    // 取消订阅
    return () => { sub && sub.unsubscribe(); }
  }, [
    enqueueSnackbar, popupMessage, setOutdated, natsChange,
    user?.uuid, user?.noti_popup, user?.noti_browser,
  ]);

  // 打开下拉通知面板
  const onOpen = e => {
    setAnchorEl(e.currentTarget);
  }

  // 关闭下拉通知面板
  const onClose = () => {
    setAnchorEl(null);
  };

  // 点击某个通知
  const onItemClick = item => {
    navigate(`/user/notification/${item.uuid}`);
  }

  return (
    <>
      <Tooltip title='通知' arrow>
        <IconButton aria-label="通知" onClick={onOpen} color="primary">
          <Badge color="secondary" badgeContent={latest.unread} max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        onClick={onClose}
        anchorOrigin={{
          vertical: 'bottom', horizontal: 'left',
        }}
        PaperProps={{
          style: { width: '30%' },
        }}>
        <Stack sx={{ my: 2 }} spacing={2}>
          <List disablePadding>
            {latest.last?.length === 0 &&
              <ListItem>
                <ListItemText primary='没有通知'
                  primaryTypographyProps={{ textAlign: 'center', color: 'gray' }}
                />
              </ListItem>
            }
            {latest.last?.map(item => (
              <ListItemButton key={item.uuid} alignItems='flex-start' dense
                onClick={() => onItemClick(item)}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.type === 1 &&
                    <Badge variant="dot" color="secondary" invisible={item.status !== 1}>
                      <NotificationsIcon color="info" />
                    </Badge>
                  }
                  {item.type === 2 &&
                    <Badge variant="dot" color="secondary" invisible={item.status !== 1}>
                      <CampaignIcon color="info" />
                    </Badge>
                  }
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Stack direction='row' alignItems='center' spacing={2}>
                      <EllipsisText variant="subtitle1" sx={{
                        flex: 1, fontWeight: 'bold', textAlign: 'left'
                      }}>
                        {item.title}
                      </EllipsisText>
                      <TimeAgo time={item.create_at} />
                    </Stack>
                  }
                  secondary={
                    <EllipsisText variant='body2' lines={3}>{item.content}</EllipsisText>
                  }
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Stack direction='row' justifyContent='space-between' sx={{ px: 2 }}>
            <Button size='small' LinkComponent={RouteLink} to='/user/notification'>
              更多通知...
            </Button>
            <IconButton size='small' color='primary' edge='end'
              LinkComponent={RouteLink} to='/user/notification/setting'>
              <SettingIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Popover>
    </>
  )
}
