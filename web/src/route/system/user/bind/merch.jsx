import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';

export default function BindMerch() {
  return (
    <Stack sx={{mx:4, my:2}}>
      <FormControl component="fieldset">
        <RadioGroup defaultValue="female">
          <FormControlLabel value="female" control={<Radio />}
            label="绑定平台内所有商户"
          />
          <FormControlLabel value="male" control={<Radio />}
            label="绑定拓展商名下所有商户（商户拓展商）"
          />
          <FormControlLabel value="other" control={<Radio />}
            label="绑定指定商户（商户）"
          />
        </RadioGroup>
      </FormControl>
    </Stack>
  )
}
