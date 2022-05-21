import { useNavigate, Link as RouteLink } from 'react-router-dom';
import { useRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextField from "@mui/material/TextField";
import FormHelperText from '@mui/material/FormHelperText';
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSnackbar } from 'notistack';
import useTitle from "~/hook/title";
import progressState from "~/state/progress";
import { post } from '~/lib/rest';
import { useSMSTab } from '../../tabstate';
import NumberTip from './numtip';

export default function Add() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [progress, setProgress] = useRecoilState(progressState);

  useHotkeys('esc', () => { navigate('..'); }, { enableOnTags: ["INPUT"] });
  useTitle('腾讯云短信服务');
  useSMSTab();

  const {
    register, handleSubmit, formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async data => {
    try {
      setProgress(true);

      data._audit = `添加腾讯云短信服务 ${data.appid}`;

      await post('/system/setting/sms/tencent-add', new URLSearchParams(data));
      enqueueSnackbar('提交成功', { variant: 'success' });
      navigate('..', { replace: true });
    } catch (err) {
      enqueueSnackbar(err.message);
    } finally {
      setProgress(false);
    }
  }

  return (
    <Stack>
      <Stack direction='row' alignItems='center' spacing={1}>
        <IconButton component={RouteLink} to='..'>
          <ArrowBackIcon color='primary' />
        </IconButton>
        <Stack>
          <Typography variant='h4'>腾讯云短信服务</Typography>
          <Typography variant='body2'>
            配置前需先注册腾讯云短信服务，注册地址:&nbsp;
            <Link href='https://cloud.tencent.com/product/sms' target='_blank'>
              https://cloud.tencent.com/product/sms
            </Link>
          </Typography>
        </Stack>
      </Stack>
      <Paper sx={{ px: 4, py: 3, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ mb: 3 }}>
            <Stack>
              <Typography variant='h6'>通讯参数</Typography>
              <FormHelperText>
                可以在腾讯短信管理后台
                <Link component='a' target='_blank'
                  href='https://console.cloud.tencent.com/smsv2/app-manage'>
                  应用列表
                </Link>
                中查询 AppId，在腾讯云后台
                <Link component='a' target='_blank'
                  href='https://console.cloud.tencent.com/cam/capi'>
                  API密钥管理
                </Link>
                中查询 Secret Id 及 Secret Key
              </FormHelperText>
            </Stack>
            <Stack direction='row' spacing={3}>
            <TextField label='Appid' variant='standard' required
              autoComplete='off'
              placeholder='应用编号，一般是10位数字'
              disabled={progress}
              inputProps={{ inputMode: 'numeric' }}
              helperText={errors?.appid?.message}
              error={errors?.appid}
              sx={{ flex: 1 }}
              {...register('appid', {
                required: "不能为空",
                maxLength: {
                  value: 32, message: '超出最大长度'
                },
                pattern: {
                  value: /^[0-9]{1,32}$/, message: '格式不符合规范'
                },
              })}
            />
              <TextField label='Secret Id' variant='standard' required
                autoComplete='off'
                placeholder='Secret Id，一串数字和大小写组合的字符串'
                disabled={progress}
                helperText={errors?.secret_id?.message}
                error={errors?.secret_id}
                sx={{ flex: 2 }}
                {...register('secret_id', {
                  required: "不能为空",
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                  pattern: {
                    value: /^[0-9A-Za-z]{1,64}$/, message: '格式不符合规范'
                  },
                })}
              />
              <TextField label='Secret Key' variant='standard' required
                autoComplete='off'
                placeholder='Secret 密钥，一串数字和大小写组合的字符串'
                disabled={progress}
                helperText={errors?.secret_key?.message}
                error={errors?.secret_key}
                sx={{ flex: 2 }}
                {...register('secret_key', {
                  required: "不能为空",
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                  pattern: {
                    value: /^[0-9A-Za-z]{1,64}$/, message: '格式不符合规范'
                  },
                })}
              />
            </Stack>
            <Stack>
              <TextField label='短信签名' variant='standard' fullWidth required
                autoComplete='off'
                placeholder='短信签名'
                disabled={progress}
                helperText={errors?.prefix?.message}
                error={errors.prefix}
                {...register('prefix', {
                  required: "不能为空",
                  maxLength: {
                    value: 64, message: '超出最大长度'
                  },
                })}
              />
              <FormHelperText>
                短信须包含签名（即短信【】中的内容），签名需要先在腾讯短信后台
                <Link href='https://console.cloud.tencent.com/smsv2/csms-sign'
                  target='_blank'>
                  签名管理
                </Link>
                中申请，通过后再回填到上面
              </FormHelperText>
            </Stack>
            <Stack sx={{ pt: 2 }}>
              <Typography variant='h6'>正文模版</Typography>
              <FormHelperText sx={{ mb: 0 }}>
                按照下面提供的参考正文，在腾讯短信
                <Link href='https://console.cloud.tencent.com/smsv2/csms-template'
                  target='_blank'>
                  正文模板管理
                </Link>
                中创建正文模板，审核通过后，将得到的模板编号回填到下面对应的输入框中
              </FormHelperText>
            </Stack>
            <Stack>
              <TextField label='通用验证码模版编号' variant='standard' required
                autoComplete='off'
                placeholder='通用短信验证码模版编号'
                disabled={progress}
                helperText={errors?.textno1?.message}
                error={errors?.textno1}
                {...register('textno1', {
                  required: "不能为空",
                  maxLength: {
                    value: 16, message: '超出最大长度'
                  },
                  pattern: {
                    value: /^[0-9]{1,16}$/, message: '格式不符合规范'
                  },
                })}
              />
              <FormHelperText>
                参考正文：您本次操作的验证码是 <NumberTip n={1} tip='短信验证码' />，
                5分钟内有效，请勿告诉他人
              </FormHelperText>
            </Stack>
          </Stack>
          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button color='secondary' disabled={isSubmitting}
              onClick={() => { navigate('..') }}>
              取消
            </Button>
            <Button type='reset' disabled={isSubmitting}>重置</Button>
            <LoadingButton variant='contained' type='submit'
              loading={isSubmitting}>
              提交
            </LoadingButton>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
