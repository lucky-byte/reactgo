import { atom } from 'recoil';

const activedState = atom({
  key: 'kanbanActivedState',
  default: [],
});

const outlinedState = atom({
  key: 'kanbanOutlinedState',
  default: false,
});

export { activedState, outlinedState }
