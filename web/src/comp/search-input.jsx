import { useEffect, useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from "lodash";

export default function SearchInput(props) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  // 延迟反应
  const debounceChange = useMemo(() => debounce(props.onChange, 500), [props.onChange]);
  useEffect(() => { return () => { debounceChange.cancel(); } }, [debounceChange]);

  // 外部可以控制 loading 状态
  useEffect(() => { setLoading(props.isLoading); }, [props.isLoading]);

  const onChange = e => {
    setValue(e.target.value);
    setLoading(true);
    debounceChange(e.target.value);
  }

  return (
    <TextField
      variant="standard" placeholder='搜索...' value={value} onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" sx={{ width: '32px' }}>
            {loading ? <CircularProgress size={20} /> : <SearchIcon />}
          </InputAdornment>
        ),
      }}
    />
  )
}
