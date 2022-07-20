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

const useAccountTab = () => {
  useTab(4);
}

const usePayTab = () => {
  useTab(5);
}

const useImageTab = () => {
  useTab(6);
}

const useNatsTab = () => {
  useTab(7);
}

const useDebugTab = () => {
  useTab(8);
}

export {
  useMailTab, useSMSTab, useGeoipTab, usePayTab, useAccountTab,
  useImageTab, useNatsTab, useDebugTab,
}
