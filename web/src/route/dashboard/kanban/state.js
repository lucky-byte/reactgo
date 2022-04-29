import { atom } from 'recoil';

const activedNodesState = atom({
  key: 'kanbanActivedNodesState',
  default: [],
});

export default activedNodesState;
