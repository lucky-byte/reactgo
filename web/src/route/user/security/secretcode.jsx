import { useState } from 'react';
import { useRecoilState } from "recoil";
import { useNavigate, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Collapse from '@mui/material/Collapse';
import Button from "@mui/material/Button";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSnackbar } from 'notistack';
import { useHotkeys } from 'react-hotkeys-hook';
import PinInput from '~/comp/pin-input';
import { useSecretCode } from '~/comp/secretcode';
import userState from "~/state/user";
import useTitle from "~/hook/title";
import { put } from '~/lib/rest';

export default function SecretCode() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const secretCode = useSecretCode();
  const [user, setUser] = useRecoilState(userState);
  const [code1, setCode1] = useState('');
  const [code1Focus, setCode1Focus] = useState(true);
  const [code1Disabled, setCode1Disabled] = useState(false);
  const [code2, setCode2] = useState('');
  const [code2Visible, setCode2Visible] = useState(false);
  const [code2Focus, setCode2Focus] = useState(false);
  const [code2Disabled, setCode2Disabled] = useState(false);
  const [hide, setHide] = useState(true);
  const [clear, setClear] = useState(Math.random());
  const [submitting, setSubmitting] = useState(false);

  useHotkeys('esc', () => { navigate('..'); });
  useTitle('设置安全操作码');

  const onCodeComplete1 = code => {
    setCode1(code);
    setCode1Disabled(true);
    setCode1Focus(false);
    setCode2Visible(true);
    setCode2Focus(true);
  }

  const onCodeComplete2 = code => {
    setCode2(code);
    setCode2Focus(false);
  }

  const onReset = () => {
    setCode1('');
    setCode2('');
    setClear(Math.random());
    setCode2Visible(false);
    setCode1Disabled(false);
    setCode2Disabled(false);
    setCode1Focus(true);
  }

  const onOK = async () => {
    if (!code1) {
      return enqueueSnackbar('请输入安全码', { variant: 'warning' });
    }
    if (code1 !== code2) {
      return enqueueSnackbar('两次输入不一致，请检查', { variant: 'warning' });
    }
    setCode2Disabled(true);

    try {
      const token = await secretCode(false);

      setSubmitting(true);

      await put('/user/secretcode', new URLSearchParams({
        secretcode_token: token, secretcode: code1,
      }));
      enqueueSnackbar('设置成功', { variant: 'success' });
      setUser({ ...user, secretcode_isset: true });
      navigate('..');
    } catch (err) {
      if (err) {
        enqueueSnackbar(err.message)
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container as='main' maxWidth='md' sx={{ mb: 4 }}>
      <Paper elevation={3} sx={{ px: 4, py: 3, mt: 4 }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <IconButton aria-label='返回' component={Link} to='..'>
            <ArrowBackIcon color='primary' />
          </IconButton>
          <Stack>
            <Typography variant='h6'>设置安全操作码</Typography>
            <Typography variant='body2'>
              安全操作码由 6 位数字组成，用于保护敏感操作，例如修改个人重要信息，进行资金操作等
            </Typography>
          </Stack>
        </Stack>
        <Paper variant='outlined' sx={{ p: 2, mt: 2 }}>
        <Stack alignItems='center' sx={{ mt: 2 }} spacing={2}>
          <Typography>请输入安全操作码</Typography>
          <PinInput hide={hide} disabled={code1Disabled} focus={code1Focus}
            clear={clear} onComplete={onCodeComplete1}
          />
          <Collapse in={code2Visible}>
            <Typography sx={{ textAlign: 'center', mt: 3, mb: 2 }}>
              请确认安全操作码
            </Typography>
            <PinInput hide={hide} disabled={code2Disabled} focus={code2Focus}
              clear={clear} onComplete={onCodeComplete2}
            />
          </Collapse>
          <IconButton aria-label='显示密码' onClick={() => {setHide(!hide)}}>
            {hide ?
              <VisibilityIcon color='primary' />
              :
              <VisibilityOffIcon color='secondary' />
            }
          </IconButton>
          <Stack direction='row' spacing={3} sx={{ py: 3 }}>
            <Button color='secondary' LinkComponent={Link} to='..'
              disabled={submitting}>
              取消
            </Button>
            <Button onClick={onReset} disabled={submitting}>重置</Button>
            <Button variant='contained' disabled={submitting} onClick={onOK}>
              设置安全操作码
            </Button>
          </Stack>
        </Stack>
        </Paper>
      </Paper>
    </Container>
  )
}
