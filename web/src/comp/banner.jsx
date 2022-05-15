import { useTheme } from "@mui/material/styles";
import BannerLight from '~/img/banner.png';
import BannerDark from '~/img/banner-dark.png';

export default function Banner(props) {
  const theme = useTheme();

  const Logo = theme.palette.mode === 'dark' ? BannerDark : BannerLight;
  const { height } = props;

  return (
    <img src={Logo} alt='Banner' height={height || 24}
      style={{ objectFit: 'contain', verticalAlign: 'middle' }}
    />
  )
}
