import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import pageState from '../state/page';

export default function usePageData() {
  const { pathname } = useLocation();
  const [page, setPage] = useRecoilState(pageState);

  const pageData = useCallback(k => {
    const key = pathname + '/' + k;
    return page[key];
  }, [page, pathname])

  const setPageData = useCallback((k, v) => {
    const newData = { ...page };
    const key = pathname + '/' + k;
    newData[key] = v;
    setPage(newData);
  }, [page, setPage, pathname])

  return [pageData, setPageData];
}
