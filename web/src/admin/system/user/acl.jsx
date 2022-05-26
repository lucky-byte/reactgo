import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSetRecoilState } from "recoil";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from '@mui/material/Typography';
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from '@mui/material/MenuItem';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import { grey } from '@mui/material/colors';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import progressState from '~/state/progress';
import useTitle from "~/hook/title";
import { get, put } from '~/lib/rest';

export default function ACL() {
  const location = useLocation();
  const navigate = useNavigate();
  const setProgress = useSetRecoilState(progressState);
  const { enqueueSnackbar } = useSnackbar();
  const [ acls, setAcls ] = useState([]);
  const [ acl, setAcl ] = useState('');
  const [ submitting, setSubmitting ] = useState(false);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('修改访问控制');

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/system/acl/');
        setAcls(resp.acls || []);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  useEffect(() => {
    for (let i = 0; i < acls.length; i++) {
      if (acls[i].uuid === location?.state?.acl) {
        setAcl(location?.state?.acl);
      }
    }
  }, [location?.state?.acl, acls]);

  const onAclChange = e => {
    setAcl(e.target.value);
  }

  const onSubmit = async () => {
    try {
      setSubmitting(true);

      const _audit = `修改用户 ${location.state?.name} 的访问控制角色`;

      await put('/system/user/acl', new URLSearchParams({
        uuid: location.state?.uuid, acl: acl, _audit,
      }));
      enqueueSnackbar(`更新成功`, { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!location.state?.uuid) {
    return <Navigate to='..' />
  }

  return (
    <Container as='main' maxWidth='sm' sx={{ mb: 2 }}>
      <Paper sx={{ px: 5, py: 3, mt: 5 }}>
        <Typography variant='h5'>修改 {location.state?.name} 的访问控制权限</Typography>
        <Typography variant='body2'>修改后将立即生效（包括已登录用户）</Typography>
        <Paper variant='outlined' sx={{ px: 3, py: 3, mt: 3 }}>
          <Stack spacing={4}>
            <TextField id='acl' label='访问控制权限' variant='standard' fullWidth
              required select
              value={acl} onChange={onAclChange}>
              {acls.map(acl => (
                <MenuItem key={acl.uuid} value={acl.uuid}>
                  <Stack direction='row' alignItems='center' sx={{ width: '100%' }}>
                    {acl.code === 0 ?
                      <Typography sx={{ flex: 1 }} color='secondary'>
                        {acl.name}
                      </Typography>
                      :
                      <Typography sx={{ flex: 1 }}>{acl.name}</Typography>
                    }
                    <Tooltip title={acl.summary} placement="top-start">
                      <HelpOutlineIcon fontSize='small' sx={{ ml: 2, color: grey[600] }} />
                    </Tooltip>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>
        <Stack direction='row' spacing={2} justifyContent='flex-end' sx={{ mt: 4 }}>
          <Button color='secondary' disabled={submitting}
            onClick={() => { navigate('..') }}>
            取消
          </Button>
          <LoadingButton variant='contained' type='submit'
            loading={submitting} onClick={onSubmit}>
            提交
          </LoadingButton>
        </Stack>
      </Paper>
    </Container>
  )
}
