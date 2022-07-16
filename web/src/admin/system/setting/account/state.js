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

const useSecureTab = () => {
  useTab(1);
}

const useOAuthTab = () => {
  useTab(2);
}

export { useSecureTab, useOAuthTab }
