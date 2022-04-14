import { atom } from 'recoil';

const lastNotificationState = atom({
  key: 'lastNotificationState',
  default: {},
});

export default lastNotificationState;

const notificationOutdatedState = atom({
  key: 'notificationOutdatedState',
  default: true,
});

export { notificationOutdatedState }
