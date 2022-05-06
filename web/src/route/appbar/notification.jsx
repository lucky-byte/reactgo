import { useEffect, useState, useCallback } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
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
import dayjs from 'dayjs';
import uuid from "uuid";
import Push from 'push.js';
import nats from '~/lib/nats';
import userState from "~/state/user";
import natsState from "~/state/nats";
import Ellipsis from "~/comp/ellipsis";
import lastNotificationState from "~/state/notification";
import { notificationOutdatedState } from "~/state/notification";
import { get } from "~/lib/rest";

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
    if (!user?.uuid) {
      return;
    }
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
  }, [ enqueueSnackbar, setLastNotification, outdated, setOutdated, user?.uuid ]);

  // 弹出提示信息
  const popupNotification = useCallback(notification => {
    if (!notification.title) {
      return;
    }
    const seeMore = () => {
      closeSnackbar();
      window.location.href = '/user/notification';
    }

    enqueueSnackbar(notification.title, {
      variant: 'default',
      preventDuplicate: true,
      autoHideDuration: 10000,
      anchorOrigin: {
        horizontal: 'right', vertical: 'top',
      },
      action: (
        <>
          <IconButton onClick={seeMore}>
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

  const onItemClick = item => {
    navigate(`/user/notification/${item.uuid}`, { state: { status: item.status } });
  }

  return (
    <>
      <Tooltip title='通知' arrow>
        <IconButton aria-label="通知" onClick={onOpen} color="primary">
          <Badge color="secondary" badgeContent={lastNotification.unread} max={99}>
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
        <Stack sx={{ mx: 2, my: 2 }} spacing={2}>
          <List>
            {lastNotification.last?.map(item => (
              <ListItemButton key={item.uuid} alignItems='flex-start' dense
                onClick={() => onItemClick(item)}>
                <ListItemIcon>
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
                      <Ellipsis variant="subtitle1" sx={{
                        flex: 1, fontWeight: 'bold', textAlign: 'left'
                      }}>
                        {item.title}
                      </Ellipsis>
                      <Typography variant="caption">
                        {dayjs(item.create_at).fromNow()}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    <Ellipsis variant='body2' lines={3}>{item.content}</Ellipsis>
                  }
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Stack direction='row' justifyContent='space-between'>
            <Button LinkComponent={RouteLink} to='/user/notification'>
              查看更多...
            </Button>
            <IconButton size='small' color='primary' edge='end'
              LinkComponent={RouteLink} to='/user/notification/setting'>
              <SettingIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Popover>
    </>
  )
}
