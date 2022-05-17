import TextField from '@mui/material/TextField';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';

export default function DateInput(props) {
  const { value, onChange, inputProps, ...others } = props;

  return (
    <MuiDatePicker
      value={value} onChange={onChange}
      inputFormat='YYYY/MM/DD'
      mask='____/__/__'
      renderInput={props => (
        <TextField {...props} variant='standard' placeholder='日期' {...inputProps} />
      )}
      OpenPickerButtonProps={{
        size: 'small', color: 'primary'
      }}
      {...others}
    />
  )
}
