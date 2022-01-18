import { atom } from 'recoil';

const codeState = atom({
  key: 'codeState',
  default: 0,
});

export default codeState;
