import { atom } from 'recoil';

const natsState = atom({
  key: 'natsState',
  default: false,
});

export default natsState;
