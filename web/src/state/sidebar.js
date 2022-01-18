import { atom } from 'recoil';

const sidebarState = atom({
  key: 'sidebarState',
  default: true,
});

export default sidebarState;
