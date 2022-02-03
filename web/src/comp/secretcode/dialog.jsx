import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const SecretCodeDialog = ({ open, onCancel, onConfirm, onClose }) => {
  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>验证</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>
          取消
        </Button>
        <Button color="primary" onClick={onConfirm}>
          验证
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SecretCodeDialog;
