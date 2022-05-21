import { atom } from 'recoil';
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";

const tabState = atom({
  key: 'settingTabState',
  default: 1,
});

export default tabState;

const useTab = value => {
  const setTab = useSetRecoilState(tabState);

  useEffect(() => { setTab(value); }, [setTab, value]);
}

const useMailTab = () => {
  useTab(1);
}

const useSMSTab = () => {
  useTab(2);
}

const useGeoipTab = () => {
  useTab(3);
}

const usePayTab = () => {
  useTab(4);
}

const useAccountTab = () => {
  useTab(5);
}

export { useMailTab, useSMSTab, useGeoipTab, usePayTab, useAccountTab }
