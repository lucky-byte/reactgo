import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSnackbar } from 'notistack';
import { get, post } from "~/lib/rest";

export default function SignupAcl(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [acls, setAcls] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { acl, setACL, aclName, setACLName } = props;

  useEffect(() => {
    (async () => {
      try {
        const resp = await get('/system/acl/');
        setAcls(resp.acls || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      }
    })();
  }, [enqueueSnackbar]);

  const onOpen = e => {
    setAnchorEl(e.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  };

  const onItemClick = async item => {
    try {
      const _audit = `修改注册用户角色为 ${item.name}`;

      await post('/system/setting/account/secure/signupacl', new URLSearchParams({
        acl: item.uuid, _audit,
      }));

      enqueueSnackbar('更新成功', { variant: 'success' });
      setACL(item.uuid);
      setACLName(item.name);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <>
      <Button
        endIcon={<KeyboardArrowDownIcon />}
        aria-controls={open ? '菜单' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        color={aclName ? 'success' : 'error'}
        onClick={onOpen}>
        {aclName || '请选择'}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose} onClick={onClose}>
        {acls.map(item => (
          <MenuItem key={item.uuid} onClick={() => onItemClick(item)}
            selected={item.uuid === acl}>
            <Stack direction='row' spacing={2} alignItems='center'>
              <Typography variant="button">{item.name}</Typography>
              <Typography variant="body2" color='gray'>{item.summary}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
