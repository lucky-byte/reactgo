import { atom } from 'recoil';

const progressState = atom({
  key: 'progressState',
  default: false,
});

export default progressState;
