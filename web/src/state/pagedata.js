import { atom } from 'recoil';

const pageDataState = atom({
  key: 'pageState',
  default: {},
});

export default pageDataState;
