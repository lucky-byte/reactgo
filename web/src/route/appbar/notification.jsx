import { useEffect, useState, useCallback } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate } from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CampaignIcon from '@mui/icons-material/Campaign';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import uuid from "uuid";
import Push from 'push.js';
import userState from "~/state/user";
import notificationState from "~/state/notification";
import nats from '~/lib/nats';
import { get } from "~/rest";

export default function Notification() {
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);
  const [notification, setNotification] = useRecoilState(notificationState);
  const [retry, setRetry] = useState(true);
  const [broker, setBroker] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // 更新未读通知数量以及最近通知
  useEffect(() => {
    if (notification.outdated) {
      (async () => {
        try {
          const resp = await get('/user/notification/last');

          setNotification({
            last: resp.last || [], unread: resp.unread, outdated: false,
          });
        } catch (err) {
          enqueueSnackbar(err.message);
        }
      })();
    }
  }, [enqueueSnackbar, setNotification, notification.outdated]);

  // 获取 nats 连接，如果系统没有配置 nats 服务器，则这个函数会一直执行，但没有太大影响
  useEffect(() => {
    const b = nats.getBroker();

    // 如果还没有连接成功，则等待 1 秒后重试
    if (!b) {
      return setTimeout(() => setRetry(!retry), 1000);
    }
    setBroker(b);
  }, [retry]);

  // 弹出提示信息
  const popupNotification = useCallback(notification => {
    if (!notification.title) {
      return;
    }
    enqueueSnackbar(notification.title, {
      variant: 'info',
      preventDuplicate: true,
      autoHideDuration: 10000,
      anchorOrigin: {
        horizontal: 'right', vertical: 'top',
      },
      action: (
        <>
          <IconButton onClick={() => {
            closeSnackbar();
            window.location.href = '/system/event';
          }}>
            <MoreHorizIcon sx={{ color: 'white' }} />
          </IconButton>
          <IconButton onClick={() => { closeSnackbar() }}>
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
        </>
      )
    });
  }, [enqueueSnackbar, closeSnackbar]);

  // 推送浏览器通知
  const pushWebNotification = notification => {
    if (!notification.title) {
      return;
    }
    const tag = uuid.v4();

    // web 通知
    if (Push.Permission.has()) {
      Push.create(notification.title, {
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
  }

  // 订阅用户通知
  useEffect(() => {
    if (!user?.uuid || !broker) {
      return;
    }
    let sub = null;

    (async () => {
      try {
        sub = broker.subscribe("reactgo.user.notification." + user.uuid);
        const codec = await nats.JSONCodec();

        for await (const m of sub) {
          const n = codec.decode(m.data);

          popupNotification(n);
          pushWebNotification(n);

          setNotification({ ...notification, outdated: true });
        }
      } catch (err) {
        enqueueSnackbar(err.message || '连接消息通道失败');
      }
    })();

    // 取消订阅
    return () => { sub && sub.unsubscribe(); }
  }, [
    enqueueSnackbar, closeSnackbar, user, broker, popupNotification,
    notification, setNotification
  ]);

  const onOpen = e => {
    setAnchorEl(e.currentTarget);
  }

  const onClose = () => {
    setAnchorEl(null);
  };

  const onAllClick = () => {
    onClose();
    navigate('/user/notification');
  }

  const onItemClick = item => {
    onClose();
    navigate('/user/notification/item', { state: { uuid: item.uuid }});
  }

  return (
    <>
      <IconButton aria-label="通知" onClick={onOpen} color="primary">
        <Badge color="secondary" badgeContent={notification.unread} max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom', horizontal: 'left',
        }}
        PaperProps={{
          style: { width: '30%' },
        }}>
        <Stack sx={{ p: 2 }} spacing={0}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant="subtitle2">通知</Typography>
            <Button size='small' onClick={onAllClick} sx={{ alignSelf: 'flex-end' }}>
              全部
            </Button>
          </Stack>
          <List>
            {notification.last?.map(item => (
              <ListItemButton key={item.uuid} alignItems="flex-start"
                onClick={() => onItemClick(item)}>
                <ListItemText
                  primary={
                    <Stack direction='row' alignItems='center' spacing={1}>
                      {item.status === 1 && <Badge variant="dot" color="secondary" />}
                      <Typography variant="subtitle1" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        flex: 1,
                      }}>
                        {item.title}
                      </Typography>
                      {item.type === 1 && <NotificationsIcon color="info" />}
                      {item.type === 2 && <CampaignIcon color="info" />}
                    </Stack>
                  }
                  secondary={item.content}
                  secondaryTypographyProps={{
                    sx: {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Stack>
      </Popover>
    </>
  )
}
