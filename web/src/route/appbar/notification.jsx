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
import dayjs from 'dayjs';
import uuid from "uuid";
import Push from 'push.js';
import nats from '~/lib/nats';
import userState from "~/state/user";
import natsState from "~/state/nats";
import Ellipsis from "~/comp/ellipsis";
import lastNotificationState from "~/state/notification";
import { notificationOutdatedState } from "~/state/notification";
import { get } from "~/rest";

export default function Notification() {
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);
  const [lastNotification, setLastNotification] = useRecoilState(lastNotificationState);
  const [outdated, setOutdated] = useRecoilState(notificationOutdatedState);
  const natsActivate = useRecoilValue(natsState);
  const [anchorEl, setAnchorEl] = useState(null);

  // 更新未读通知数量以及最近通知
  useEffect(() => {
    if (outdated) {
      (async () => {
        try {
          const resp = await get('/user/notification/last');

          setLastNotification({ last: resp.last || [], unread: resp.unread });
          setOutdated(false);
        } catch (err) {
          enqueueSnackbar(err.message);
        }
      })();
    }
  }, [ enqueueSnackbar, setLastNotification, outdated, setOutdated ]);

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

  // 弹出浏览器通知
  const popupWebNotification = notification => {
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
    if (!user?.uuid || !natsActivate) {
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

          popupNotification(n);
          popupWebNotification(n);

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
    enqueueSnackbar, closeSnackbar, natsActivate, user?.uuid, popupNotification,
    setOutdated,
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
    navigate(`/user/notification/${item.uuid}`);
  }

  return (
    <>
      <IconButton aria-label="通知" onClick={onOpen} color="primary">
        <Badge color="secondary" badgeContent={lastNotification.unread} max={99}>
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
            {lastNotification.last?.map(item => (
              <ListItemButton key={item.uuid} alignItems="flex-start"
                onClick={() => onItemClick(item)}>
                <ListItemText
                  disableTypography
                  primary={
                    <Stack direction='row' alignItems='center' spacing={1}>
                      {item.status === 1 && <Badge variant="dot" color="secondary" />}
                      <Ellipsis variant="subtitle1" sx={{ flex: 1, fontWeight: 'bold' }}>
                        {item.title}
                      </Ellipsis>
                      {item.type === 1 && <NotificationsIcon color="info" />}
                      {item.type === 2 && <CampaignIcon color="info" />}
                    </Stack>
                  }
                  secondary={
                    <Stack>
                      <Typography variant="caption">
                        {dayjs(item.create_at).fromNow()}
                      </Typography>
                      <Ellipsis variant='body2' lines={3}>{item.content}</Ellipsis>
                    </Stack>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Stack>
      </Popover>
    </>
  )
}
