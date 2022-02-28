import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import pageDataState from '../state/pagedata';

export default function usePageData() {
  const { pathname } = useLocation();
  const [data, setData] = useRecoilState(pageDataState);

  const pageData = useCallback(k => {
    const key = pathname + '/' + k;
    return data[key];
  }, [data, pathname])

  const setPageData = useCallback((k, v, ...rest) => {
    const key = pathname + '/' + k;

    const newData = { ...data };
    newData[key] = v;

    if (rest) {
      if (rest.length % 2 !== 0) {
        throw new Error('setPageData() 参数数量必须是偶数');
      }
      for (let i = 0; i < rest.length; i += 2) {
        newData[rest[i]] = rest[i + 1];
      }
    }
    setData(newData);
  }, [data, setData, pathname])

  return [pageData, setPageData];
}
