import { atom } from 'recoil';

const printModalState = atom({
  key: 'printModalState',
  default: false,
});

export default printModalState;
