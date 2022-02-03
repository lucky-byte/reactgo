import { useState, useCallback, Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import userState from '~/state/user';
import SecretCodeContext from './context';
import SecretCodeDialog from './dialog';

const SecretCodeProvider = ({ children }) => {
  const user = useRecoilValue(userState);
  const [resolveReject, setResolveReject] = useState([]);
  const [resolve, reject] = resolveReject;

  const verify = useCallback(() => {
    return new Promise((resolve, reject) => {
      // 未设置安全操作码
      if (!user?.secretcode_isset) {
        return resolve("");
      }
      setResolveReject([resolve, reject]);
    });
  }, [user?.secretcode_isset]);

  const onClose = useCallback(() => {
    setResolveReject([]);
  }, []);

  const onCancel = useCallback(() => {
    if (reject) {
      reject();
      onClose();
    }
  }, [reject, onClose]);

  const onVerify = useCallback(() => {
    if (resolve) {
      resolve();
      onClose();
    }
  }, [resolve, onClose]);

  return (
    <Fragment>
      <SecretCodeContext.Provider value={verify}>
        {children}
      </SecretCodeContext.Provider>
      <SecretCodeDialog
        open={resolveReject.length === 2}
        onClose={onClose}
        onCancel={onCancel}
        onConfirm={onVerify}
      />
    </Fragment>
  );
};

export default SecretCodeProvider;
