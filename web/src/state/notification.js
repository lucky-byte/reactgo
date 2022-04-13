import { atom } from 'recoil';

const notificationState = atom({
  key: 'notificationState',
  default: {
    outdated: true,
  },
});

export default notificationState;
