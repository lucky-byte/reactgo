import { useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import { useSnackbar } from 'notistack';
import { post } from "~/lib/rest";

// 导入
export default function Import(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [disabled, setDisabled] = useState(false);

  const { requestRefresh } = props;

  const onOpen = () => {
    setOpen(true);
  }

  const onClose = () => {
    setFile(null);
    setFilename('');
    setOpen(false);
  }

  // 改变导入文件
  const onFileChange = e => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return setFilename('');
    }
    const file = e.target.files[0];

    if (file.size > 1024 * 10) {
      return enqueueSnackbar('文件大小超出范围', { variant: 'error' });
    }
    setFile(file);
    setFilename(file.name);
  }

  // 确定导入
  const onConfirm = async () => {
    if (!file) {
      return enqueueSnackbar('请选择导入文件', { variant: 'warning' });
    }
    try {
      setDisabled(true);

      const form = new FormData();
      form.append("file", file);

      form.append('_audit', '从文件导入邮件服务配置');

      await post('/system/setting/mail/import', form);

      enqueueSnackbar('导入成功', { variant: 'success' });
      onClose();
      requestRefresh();
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setDisabled(false);
    }
  }

  return (
    <>
      <Button color="warning" onClick={onOpen}>导入</Button>
      <Dialog open={open} onClose={onClose} maxWidth='xs'>
        <DialogTitle>导入配置</DialogTitle>
        <DialogContent>
          <DialogContentText>
            导入文件格式必须与导出的文件格式一致。一般的操作流程是先导出备份文件，后续再从备份文件导入
          </DialogContentText>
          <TextField fullWidth disabled focused sx={{ mt: 3 }}
            label='导入文件'
            placeholder="请选择"
            value={filename}
            InputProps={{
              endAdornment:
                <InputAdornment position="end">
                  <input id="importfile" accept="application/json" type="file"
                    hidden onChange={onFileChange}
                  />
                  <Button htmlFor='importfile' component="label">
                    选择文件
                  </Button>
                </InputAdornment>
            }}
          />
          <FormHelperText>
            导入文件中<strong>名称</strong>相同的记录会被忽略
          </FormHelperText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>取消</Button>
          <Button variant="contained" disabled={disabled} onClick={onConfirm}>
            导入
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
