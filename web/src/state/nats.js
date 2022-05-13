import { atom } from 'recoil';

const natsState = atom({
  key: 'natsState',
  default: 0,
});

export default natsState;
