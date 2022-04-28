import { atom } from 'recoil';

const kanbanState = atom({
  key: 'kanbanState',
  default: [],
});

export default kanbanState;
