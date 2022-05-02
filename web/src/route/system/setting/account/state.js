import { atom } from 'recoil';
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";

const tabState = atom({
  key: 'accountSettingTabState',
  default: 1,
});

export default tabState;

const useTab = value => {
  const setTab = useSetRecoilState(tabState);

  useEffect(() => { setTab(value); }, [setTab, value]);
}

const useIndexTab = () => {
  useTab(1);
}

const useOAuthTab = () => {
  useTab(3);
}

export { useIndexTab, useOAuthTab }
