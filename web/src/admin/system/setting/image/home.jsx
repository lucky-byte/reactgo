import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from '@mui/material/TextField';
import Collapse from "@mui/material/Collapse";
import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'notistack';
import InplaceInput from '~/comp/inplace-input';
import useTitle from "~/hook/title";
import progressState from '~/state/progress';
import { get, post } from "~/lib/rest";
import { useImageTab } from '../tabstate';

export default function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const [place, setPlace] = useState(1);
  const [rootPath, setRootPath] = useState('');

  useTitle('图片存储');
  useImageTab();

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/system/setting/image/');
        setPlace(resp.place);
        setRootPath(resp.rootpath);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  const onPlaceChange = async e => {
    try {
      const place = e.target.value;

      const _audit = '修改图片文件存储方式';

      await post('/system/setting/image/place', new URLSearchParams({
        place, _audit
      }));
      setPlace(place);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  };

  const onRootPathChange = async path => {
    try {
      const _audit = '修改图片文件存储文件系统路径';

      await post('/system/setting/image/rootpath', new URLSearchParams({
        rootpath: path, _audit,
      }));
      setRootPath(path);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack>
      <Typography variant='h4'>图片存储</Typography>
      <Typography variant='body2'>
        如何存储用户上传的图片文件，修改配置立即生效，可能导致非预期结果，请谨慎操作
      </Typography>
      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Stack flex={1}>
            <Typography>图片存储方式</Typography>
            <FormHelperText>
              设置以哪种方式存储用户上传的图片文件，通常在系统部署时确定一种方式，不建议更换
            </FormHelperText>
          </Stack>
          <TextField select variant='standard' size='small'
            value={place} onChange={onPlaceChange}>
            <MenuItem value={1}>数据库</MenuItem>
            <MenuItem value={2}>文件系统</MenuItem>
          </TextField>
        </Stack>
        <Collapse in={place === 2}>
          <Stack direction='row' alignItems='center' mt={2} spacing={1}>
            <Typography variant='subtitle2'>
              文件系统路径:
            </Typography>
            <InplaceInput sx={{ flex: 1 }} text={rootPath}
              placeholder='请填写' color="primary" onConfirm={onRootPathChange}
            />
          </Stack>
          <FormHelperText sx={{ mt: 1 }}>
            必须是绝对路径，可以使用 ~ 表示用户 HOME 目录，例如 ~/images
            表示用户目录下的 images 目录
          </FormHelperText>
        </Collapse>
      </Paper>
    </Stack>
  )
}
