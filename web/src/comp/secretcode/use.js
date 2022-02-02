import { useContext } from 'react';
import SecretCodeContext from './context';

const useSecretCode = () => {
  const confirm = useContext(SecretCodeContext);
  return confirm;
};

export default useSecretCode;
