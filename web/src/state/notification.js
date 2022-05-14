import { atom } from 'recoil';

const latestNotificationState = atom({
  key: 'latestNotificationState',
  default: {},
});

export default latestNotificationState;

const notificationOutdatedState = atom({
  key: 'notificationOutdatedState',
  default: true,
});

export { notificationOutdatedState }
