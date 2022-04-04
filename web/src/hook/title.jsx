import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import titleState from "~/state/title";

export default function useTitle(title) {
  const setTitle = useSetRecoilState(titleState);

  useEffect(() => { setTitle(title); }, [setTitle, title]);
}
