import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Beian from '~/img/beian.png';
import Banner from './banner';

export default function Footer(props) {
  const theme = useTheme();
  const sm_up = useMediaQuery(theme.breakpoints.up('sm'));

  const { nobanner, ...others } = props;

  return (
    <Stack {...others} spacing={1}>
      <Stack direction={sm_up ? 'row' : 'column-reverse'}
        alignItems='center' justifyContent='center' spacing={1}>
        <Typography variant='caption'>
          版权所有 &copy; {new Date().getFullYear()} {process.env.REACT_APP_COMPANY_NAME_FULL}
        </Typography>
        <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
          {process.env.REACT_APP_ICP &&
            <Stack direction='row' alignItems='flex-start'>
              <img src={Beian} alt='备案' height={14} width={14} />
              <Typography variant='caption'>
                <Link href={process.env.REACT_APP_ICP_LINK} target='_blank'
                  underline='hover' sx={{ ml: '3px' }}>
                  {process.env.REACT_APP_ICP}
                </Link>
              </Typography>
            </Stack>
          }
          <Typography variant='caption'>
            <Link href='/privacy' target='_blank' underline='hover'>隐私政策</Link>
          </Typography>
          <Typography variant='caption'>
            <Link href='/terms' target='_blank' underline='hover'>服务条款</Link>
          </Typography>
        </Stack>
      </Stack>
      {!nobanner && <Banner height={26} />}
    </Stack>
  )
}
