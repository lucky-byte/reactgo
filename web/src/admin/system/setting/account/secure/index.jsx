import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Switch from '@mui/material/Switch';
import Collapse from "@mui/material/Collapse";
import FormHelperText from "@mui/material/FormHelperText";
import Divider from "@mui/material/Divider";
import { useSnackbar } from 'notistack';
import InplaceInput from '~/comp/inplace-input';
import SecretText from '~/comp/secret-text';
import useTitle from "~/hook/title";
import { get, post } from "~/lib/rest";
import progressState from '~/state/progress';
import { useSecureTab } from "../state";
import SignupAcl from "./signupacl";
import JWTSignKeyButton from "./jwtsignkey";

export default function Secure() {
  const { enqueueSnackbar } = useSnackbar();
  const setProgress = useSetRecoilState(progressState);
  const [signupable, setSignupable] = useState(false);
  const [signupACL, setSignupACL] = useState('');
  const [signupACLName, setSignupACLName] = useState('');
  const [lookUserid, setLookUserid] = useState(false);
  const [resetPass, setResetPass] = useState(false);
  const [duration, setDuration] = useState(0);
  const [jwtSignKey, setJWTSignKey] = useState(0);

  useTitle('账号安全');
  useSecureTab();

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const resp = await get('/system/setting/account/secure/');
        setSignupable(resp.signupable);
        setSignupACL(resp.signupacl);
        setSignupACLName(resp.signupaclname);
        setLookUserid(resp.lookuserid);
        setResetPass(resp.resetpass);
        setDuration(resp.sessduration);
        setJWTSignKey(resp.jwtsignkey);
      } catch (err) {
        enqueueSnackbar(err.message);
      } finally {
        setProgress(false);
      }
    })();
  }, [enqueueSnackbar, setProgress]);

  // 开放用户注册
  const onSignupableCheck = async () => {
    try {
      const _audit = `${signupable ? '禁止' : '允许'}用户注册`;

      await post('/system/setting/account/secure/signupable', new URLSearchParams({
        signupable: !signupable, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setSignupable(!signupable);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 允许用户找回登录名
  const onLookUseridCheck = async () => {
    try {
      const _audit = `${lookUserid ? '禁止' : '允许'}用户找回登录名`;

      await post('/system/setting/account/secure/lookuserid', new URLSearchParams({
        lookuserid: !lookUserid, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setLookUserid(!lookUserid);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 允许用户找回密码
  const onResetPassCheck = async () => {
    try {
      const _audit = `${resetPass ? '禁止' : '允许'}用户找回登录密码`;

      await post('/system/setting/account/secure/resetpass', new URLSearchParams({
        resetpass: !resetPass, _audit,
      }));
      enqueueSnackbar('更新成功', { variant: 'success' });
      setResetPass(!resetPass);
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  // 修改会话持续时间
  const onChangeDuration = async v => {
    try {
      const _audit = `修改用户登录会话持续时间为 ${v}`;

      await post('/system/setting/account/secure/duration', new URLSearchParams({
        duration: v, _audit,
      }));
      setDuration(v);
      enqueueSnackbar('更新成功', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message);
    }
  }

  return (
    <Stack mt={2} mb={3}>
      <Typography variant="h6">账号注册</Typography>
      <Paper variant="outlined" sx={{ mt: 1 }}>
        <Stack p={2}>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Stack>
              <Typography>开放账号注册</Typography>
              <FormHelperText>
                开启后任何用户都可以注册账号，关闭后则只能通过管理员在后台添加用户账号
              </FormHelperText>
            </Stack>
            <Switch checked={signupable} onChange={onSignupableCheck}
              inputProps={{ 'aria-label': '是否开放用户注册' }}
            />
          </Stack>
          <Collapse in={signupable}>
            <Stack direction='row' alignItems='center' spacing={1} mt={2}>
              <Stack flex={1}>
                <Typography>访问控制角色</Typography>
                <FormHelperText>
                  请选择新注册账号默认采用的访问控制角色，已注册账号不受影响
                </FormHelperText>
              </Stack>
              <SignupAcl
                acl={signupACL} setACL={setSignupACL}
                aclName={signupACLName} setACLName={setSignupACLName}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Paper>
      <Typography variant="h6" mt={4}>登录会话</Typography>
      <Paper variant="outlined" sx={{ mt: 1 }}>
        <Stack p={2}>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Typography>登录会话持续时间(分钟):</Typography>
            <InplaceInput text={duration || ''} onConfirm={onChangeDuration}
              color='primary' sx={{ flex: 1 }}
            />
          </Stack>
          <FormHelperText>
            用户登录成功后会话保持时间，以分钟为单位，例如 1440 表示持续时间为 1 天。
            已登录用户不受影响
          </FormHelperText>
        </Stack>
        <Divider />
        <Stack direction='row' alignItems='center' justifyContent='space-between' p={2}>
          <Stack>
            <Typography>允许用户找回登录名</Typography>
            <FormHelperText>
              登录名是用户登录系统的唯一凭证，如果用户忘记了登录名，可以打开此选项允许用户找回登录名
            </FormHelperText>
          </Stack>
          <Switch checked={lookUserid} onChange={onLookUseridCheck}
            inputProps={{ 'aria-label': '允许或禁止找回登录名' }}
          />
        </Stack>
        <Divider />
        <Stack direction='row' alignItems='center' justifyContent='space-between' p={2}>
          <Stack>
            <Typography>允许用户找回登录密码</Typography>
            <FormHelperText>
              找回密码需要验证用户的手机号和邮箱地址，如果不允许，则需要管理员登录后台帮助用户重置密码
            </FormHelperText>
          </Stack>
          <Switch checked={resetPass} onChange={onResetPassCheck}
            inputProps={{ 'aria-label': '允许或禁止找回登录密码' }}
          />
        </Stack>
        <Divider />
        <Stack direction='row' alignItems='center' justifyContent='space-between' p={2}>
          <Stack>
            <Stack direction='row' alignItems='center' spacing={2}>
              <Typography>会话签名密钥:</Typography>
              <SecretText text={jwtSignKey} />
            </Stack>
            <FormHelperText>
              用户登录后签发的 Json Web Token 使用该密钥进行签名，恶意用户可以使用该密钥伪造登录会话凭证
            </FormHelperText>
          </Stack>
          <JWTSignKeyButton setJWTSignKey={setJWTSignKey} />
        </Stack>
      </Paper>
    </Stack>
  )
}
