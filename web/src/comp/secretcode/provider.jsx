import { useState, useCallback, Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import userState from '~/state/user';
import SecretCodeContext from './context';
import SecretCodeDialog from './dialog';

const SecretCodeProvider = ({ children }) => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [resolveReject, setResolveReject] = useState([]);
  const [tokenCache, setTokenCache] = useState({});

  const [resolve, reject] = resolveReject;

  const popupTip = useCallback(() => {
    const onSet = key => {
      navigate('/user/security/secretcode');
      closeSnackbar(key);
    }
    const onNever = key => {
      localStorage.setItem("secretcode_prompt", "off");
      closeSnackbar(key);
    }

    const action = key => (
      <Fragment>
        <Button color='warning' onClick={() => closeSnackbar(key)}>暂不</Button>
        <Button color='error' onClick={() => onNever(key)}>不再提醒</Button>
        <Button onClick={() => onSet(key)}>去设置</Button>
      </Fragment>
    );
    enqueueSnackbar('该操作可以通过安全操作码进行保护，请在账户安全设置中设置安全操作码', {
      variant: 'default',
      autoHideDuration: 20000,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
      action: action,
      preventDuplicate: true,
    });
  }, [enqueueSnackbar, closeSnackbar, navigate]);

  // 启动验证
  const verify = useCallback((prompt = true) => {
    return new Promise((resolve, reject) => {
      // 未设置安全操作码，不用验证，弹出提示
      if (!user?.secretcode_isset) {
        if (prompt) {
          if (localStorage.getItem('secretcode_prompt') !== 'off') {
            popupTip();
          }
        }
        return resolve("");
      }
      // 检查 cache, 5 分钟内有效
      if (tokenCache.token && tokenCache.time) {
        if (dayjs().isBefore(tokenCache.time.add(5, 'minute'))) {
          return resolve(tokenCache.token);
        }
      }
      setResolveReject([resolve, reject]);
    });
  }, [user?.secretcode_isset, popupTip, tokenCache]);

  // 取消验证
  const onClose = useCallback(() => {
    if (reject) {
      reject();
      setResolveReject([]);
    }
  }, [reject]);

  // 验证成功
  const onSuccess = useCallback(async token => {
    if (resolve) {
      resolve(token);
      setResolveReject([]);
      setTokenCache({ token, time: dayjs() });
    }
  }, [resolve]);

  return (
    <Fragment>
      <SecretCodeContext.Provider value={verify}>
        {children}
      </SecretCodeContext.Provider>
      <SecretCodeDialog
        open={resolveReject.length === 2}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Fragment>
  );
};

export default SecretCodeProvider;
