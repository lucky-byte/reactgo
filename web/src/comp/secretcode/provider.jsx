import { useState, useCallback, Fragment } from 'react';
import SecretCodeContext from './context';
import SecretCodeDialog from './dialog';

const DEFAULT_OPTIONS = {
  title: 'Are you sure?',
  description: '',
  content: null,
  confirmationText: 'Ok',
  cancellationText: 'Cancel',
  dialogProps: {},
  confirmationButtonProps: {},
  cancellationButtonProps: {},
  titleProps: {},
  contentProps: {},
  allowClose: true,
};

const buildOptions = (defaultOptions, options) => {
  const dialogProps = {
    ...(defaultOptions.dialogProps || DEFAULT_OPTIONS.dialogProps),
    ...(options.dialogProps || {}),
  };
  const confirmationButtonProps = {
    ...(defaultOptions.confirmationButtonProps || DEFAULT_OPTIONS.confirmationButtonProps),
    ...(options.confirmationButtonProps || {}),
  };
  const cancellationButtonProps = {
    ...(defaultOptions.cancellationButtonProps || DEFAULT_OPTIONS.cancellationButtonProps),
    ...(options.cancellationButtonProps || {}),
  };
  const titleProps = {
    ...(defaultOptions.titleProps || DEFAULT_OPTIONS.titleProps),
    ...(options.titleProps || {}),
  };
  const contentProps = {
    ...(defaultOptions.contentProps || DEFAULT_OPTIONS.contentProps),
    ...(options.contentProps || {}),
  };

  return {
    ...DEFAULT_OPTIONS,
    ...defaultOptions,
    ...options,
    dialogProps,
    confirmationButtonProps,
    cancellationButtonProps,
    titleProps,
    contentProps,
  }
};

const SecretCodeProvider = ({ children, defaultOptions = {} }) => {
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS, ...defaultOptions });
  const [resolveReject, setResolveReject] = useState([]);
  const [resolve, reject] = resolveReject;

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      setOptions(buildOptions(defaultOptions, options));
      setResolveReject([resolve, reject]);
    });
  }, []);

  const handleClose = useCallback(() => {
    setResolveReject([]);
  }, []);

  const handleCancel = useCallback(() => {
    if (reject) {
      reject();
      handleClose();
    }
  }, [reject, handleClose]);

  const handleConfirm = useCallback(() => {
    if (resolve) {
      resolve();
      handleClose();
    }
  }, [resolve, handleClose]);

  return (
    <Fragment>
      <SecretCodeContext.Provider value={confirm}>
        {children}
      </SecretCodeContext.Provider>
      <SecretCodeDialog
        open={resolveReject.length === 2}
        options={options}
        onClose={handleClose}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </Fragment>
  );
};

export default SecretCodeProvider;
