import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Beian from '~/img/beian.png';
import Banner from './banner';

export default function Footer(props) {
  const { ...others } = props;

  return (
    <Stack {...others} spacing={1}>
      <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
        <Typography variant='caption'>
          &copy; {new Date().getFullYear()} {process.env.REACT_APP_COMPANY_NAME}
        </Typography>
        {process.env.REACT_APP_ICP &&
          <Stack direction='row' alignItems='center'>
            <img src={Beian} alt='备案' height={14} width={14} />
            <Typography variant='caption'>
              <Link href={process.env.REACT_APP_ICP_LINK} target='_blank'
                underline='hover' sx={{ ml: '2px' }}>
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
      <Banner height={26} />
    </Stack>
  )
}
