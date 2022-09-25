import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function DateInput(props) {
  const { value, onChange, startAdornment, ...others } = props;

  const onClear = () => {
    onChange(null);
  }

  return (
    <DatePicker
      value={value} onChange={onChange}
      inputFormat='YYYY/MM/DD'
      mask='____/__/__'
      renderInput={p => (
        <TextField {...p} variant='standard' sx={{ maxWidth: 186 }}
          InputProps={{
            startAdornment: startAdornment,
            endAdornment: (
              <Stack direction='row' spacing={0}>
                {value &&
                  <InputAdornment position="end" p={0}>
                    <IconButton size='small' onClick={onClear}>
                      <CloseIcon fontSize='small' color='error' />
                    </IconButton>
                  </InputAdornment>
                }
                {p.InputProps?.endAdornment}
              </Stack>
            )
          }}
        />
      )}
      OpenPickerButtonProps={{
        size: 'small', color: 'primary', sx: { pl: 0 }
      }}
      {...others}
    />
  )
}

