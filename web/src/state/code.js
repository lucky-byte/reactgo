import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { atom } from 'recoil';

const codeState = atom({
  key: 'codeState',
  default: 0,
});

export default codeState;

const useSetCode = code => {
  const setCode = useSetRecoilState(codeState);

  useEffect(() => { setCode(code); }, [setCode, code]);
}

export { useSetCode }
