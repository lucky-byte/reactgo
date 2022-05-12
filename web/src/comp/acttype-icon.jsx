import GitHubIcon from '@mui/icons-material/GitHub';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Logo from '~/img/logo.png';
import GoogleIcon from '~/img/google.svg';

// 登录账号类型图标
export default function ActTypeIcon(props) {
  const { type, provider } = props;

  if (type === 1) {
    return (
      <img src={Logo} alt='Google' style={{
        width: 22, height: 22, verticalAlign: 'middle'
      }} />
    )
  }
  if (provider === 'github') {
    return <GitHubIcon sx={{ verticalAlign: 'middle' }} />
  }
  if (provider === 'google') {
    return (
      <img src={GoogleIcon} alt='Google' style={{
        width: 22, height: 22, verticalAlign: 'middle'
      }} />
    )
  }
  return <QuestionMarkIcon color='error' sx={{ verticalAlign: 'middle' }} />
}
