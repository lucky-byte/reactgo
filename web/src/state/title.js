import { atom } from 'recoil';

const titleState = atom({
  key: 'titleState',
  default: 'LuckyByte',
});

export default titleState;
